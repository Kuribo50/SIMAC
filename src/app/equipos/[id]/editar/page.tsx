import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import EditEquipoForm from "./EditEquipoForm";
import AsignarPautaSection from "./AsignarPautaSection";

interface Props {
  params: Promise<{ id: string }>;
}

async function getEquipo(id: string) {
  return prisma.equipo.findUnique({
    where: { id },
    include: {
      ubicacion: true,
      tipoEquipo: true,
      pautaAsignada: true,
      mantenciones: {
        where: {
          estadoMantencion: {
            in: ["PENDIENTE", "EN_PROCESO"],
          },
        },
        include: {
          pauta: true,
        },
        orderBy: { fecha: "desc" },
        take: 5,
      },
    },
  });
}

async function getTiposEquipo() {
  return prisma.tipoEquipo.findMany({
    orderBy: [{ categoria: "asc" }, { subcategoria: "asc" }],
  });
}

async function getUbicaciones() {
  return prisma.ubicacion.findMany({
    orderBy: [{ establecimiento: "asc" }, { area: "asc" }],
  });
}

async function getPautasActivas() {
  return prisma.pautaMantenimiento.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export default async function EditarEquipoPage({ params }: Props) {
  const { id } = await params;

  const [equipo, tiposEquipo, ubicaciones, pautas] = await Promise.all([
    getEquipo(id),
    getTiposEquipo(),
    getUbicaciones(),
    getPautasActivas(),
  ]);

  if (!equipo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/equipos/${id}`}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-full shadow-sm border border-slate-200 transition-all hover:bg-slate-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editar Equipo</h1>
            <p className="text-slate-600">{equipo.nombre}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - 2 columnas */}
          <div className="lg:col-span-2">
            <EditEquipoForm
              equipo={equipo}
              tiposEquipo={tiposEquipo}
              ubicaciones={ubicaciones}
            />
          </div>

          {/* Sidebar - Asignar Pauta */}
          <div className="lg:col-span-1">
            <AsignarPautaSection
              equipoId={equipo.id}
              equipoNombre={equipo.nombre}
              equipoEstado={equipo.estado}
              pautas={pautas}
              mantencionesPendientes={equipo.mantenciones}
              pautaAsignada={equipo.pautaAsignada}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
