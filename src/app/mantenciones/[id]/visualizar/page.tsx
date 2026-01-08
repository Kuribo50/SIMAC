import { redirect } from "next/navigation";
import ChecklistSignatureWrapper from "./ChecklistSignatureWrapper";
import InlineEditableTable from "./InlineEditableTable";
import FolioDisplay from "./FolioDisplay";
import VisualizarNavBar from "./VisualizarNavBar";
import prisma from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

const mantencionInclude = {
  equipo: {
    include: {
      ubicacion: true,
      tipoEquipo: true,
    },
  },
  pauta: {
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  },
  realizadoPor: true,
  respuestas: {
    include: {
      pautaItem: true,
    },
    orderBy: {
      pautaItem: {
        order: "asc",
      },
    },
  },
  firmas: {
    include: {
      user: true,
    },
    orderBy: { firmadoEn: "asc" },
  },
} as const;

async function fetchMantencion(id: string) {
  return prisma.mantencion.findUnique({
    where: { id },
    include: mantencionInclude,
  });
}

async function ensureMantencionFolio(mantencionId: string) {
  await prisma.$transaction(async (tx) => {
    const current = await tx.mantencion.findUnique({
      where: { id: mantencionId },
      select: { folio: true },
    });

    if (!current || current.folio) {
      return;
    }

    const lastMantencionWithFolio = await tx.mantencion.findFirst({
      where: { folio: { not: null } },
      orderBy: { folio: "desc" },
      select: { folio: true },
    });

    const nextFolio = (lastMantencionWithFolio?.folio || 0) + 1;

    await tx.mantencion.update({
      where: { id: mantencionId },
      data: { folio: nextFolio },
    });
  });
}

async function getMantencionWithResponses(id: string) {
  let mantencion = await fetchMantencion(id);

  if (mantencion && !mantencion.folio) {
    await ensureMantencionFolio(id);
    mantencion = await fetchMantencion(id);
  }

  return mantencion;
}

async function getUbicaciones() {
  const ubicaciones = await prisma.ubicacion.findMany({
    select: {
      id: true,
      area: true,
      establecimiento: true,
    },
    orderBy: [{ establecimiento: "asc" }, { area: "asc" }],
  });

  return ubicaciones;
}

export default async function MantencionVisualizarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const [mantencion, ubicaciones, currentUser] = await Promise.all([
    getMantencionWithResponses(id),
    getUbicaciones(),
    getCurrentUser(),
  ]);

  if (!mantencion) {
    redirect("/planificacion");
  }

  const userIsAdmin = isAdmin(currentUser);
  const tieneFirmas = mantencion.firmas && mantencion.firmas.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white">
      {/* Top Navigation Bar */}
      <VisualizarNavBar
        mantencionId={id}
        equipoNombre={mantencion.equipo?.nombre || "Equipo"}
        equipoId={mantencion.equipo?.id || ""}
        tipoMantencion={mantencion.tipoMantencion}
        estado={mantencion.estadoMantencion}
        isAdmin={userIsAdmin}
        tieneFirmas={tieneFirmas}
        mantencion={mantencion}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none">
        {/* Document Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-0 print:rounded-none overflow-hidden">
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:bg-white">
            <div className="p-6 print:p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Logo */}
                  <div className="w-16 h-16 print:w-14 print:h-14 shrink-0 bg-white rounded-lg border border-slate-200 dark:border-slate-700 p-2 print:border-2 print:border-slate-300">
                    <img
                      src="/logo_disamtome.png"
                      alt="DISAM Tomé"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title & Location */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1 print:text-lg">
                      Pauta de Mantenimiento{" "}
                      {mantencion.tipoMantencion === "PREVENTIVO"
                        ? "Preventivo"
                        : "Correctivo"}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {mantencion.equipo?.ubicacion?.area || "Sin ubicación"} •{" "}
                      {mantencion.equipo?.ubicacion?.establecimiento ||
                        "CESFAM"}
                    </p>
                  </div>
                </div>

                {/* Folio Badge */}
                <div>
                  <FolioDisplay
                    initialFolio={mantencion.folio}
                    isCompleted={mantencion.estadoMantencion === "COMPLETADA"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div className="p-6 print:p-4 space-y-6">
            {/* Equipment Info Table */}
            <InlineEditableTable
              mantencionId={id}
              equipoNombre={
                mantencion.equipo?.nombre ||
                mantencion.equipo?.tipoEquipo?.subcategoria ||
                "-"
              }
              ubicacion={mantencion.equipo?.ubicacion?.area || "-"}
              ubicacionId={mantencion.equipo?.ubicacion?.id || ""}
              inventario={mantencion.equipo?.inventario || "-"}
              marca={mantencion.equipo?.marca || "-"}
              modelo={mantencion.equipo?.modelo || "-"}
              serie={mantencion.equipo?.serie || "-"}
              periodicidad={mantencion.periodicidad || null}
              personalTecnico={
                mantencion.realizadoPor?.name ||
                mantencion.firmas?.find((f: any) => f.role === "TECNICO")
                  ?.nombreFirmante ||
                "-"
              }
              equiposDePrueba={mantencion.equiposDePrueba}
              fecha={mantencion.fecha}
              estadoMantencion={mantencion.estadoMantencion}
              pautaNombre={mantencion.pauta?.nombre || null}
              ubicaciones={ubicaciones}
            />

            {/* Checklist & Signatures */}
            <ChecklistSignatureWrapper
              mantencionId={id}
              items={mantencion.pauta?.items || []}
              respuestas={mantencion.respuestas || []}
              estadoMantencion={mantencion.estadoMantencion}
              observaciones={mantencion.observaciones}
              firmas={mantencion.firmas || []}
              establecimiento={
                mantencion.equipo?.ubicacion?.establecimiento || "CESFAM"
              }
              isAdmin={userIsAdmin}
              adminName={
                currentUser?.name || currentUser?.email || "Administrador"
              }
              editedAfterCompletionAt={mantencion.editedAfterCompletionAt}
              editedAfterCompletionBy={mantencion.editedAfterCompletionBy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
