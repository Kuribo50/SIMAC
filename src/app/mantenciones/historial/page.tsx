import Link from "next/link";
import prisma from "@/lib/prisma";
import ExportGlobalButton from "../components/ExportGlobalButton";
import HistorialTable from "./HistorialTable";

// Obtener todas las mantenciones con datos completos
async function getMantenciones() {
  const mantenciones = await prisma.mantencion.findMany({
    include: {
      equipo: {
        include: {
          ubicacion: true,
          tipoEquipo: true,
        },
      },
      pauta: true,
      realizadoPor: true,
      respuestas: true,
      firmas: {
        select: {
          id: true,
          role: true,
          nombreFirmante: true,
          cargoFirmante: true,
        },
      },
    },
    orderBy: { fecha: "desc" },
  });

  return mantenciones;
}

// Obtener lista de centros únicos
async function getCentros() {
  const ubicaciones = await prisma.ubicacion.findMany({
    select: { establecimiento: true },
    distinct: ["establecimiento"],
  });
  return ubicaciones.map((u) => u.establecimiento).filter(Boolean) as string[];
}

// Obtener lista de equipos
async function getEquipos() {
  const equipos = await prisma.equipo.findMany({
    select: { id: true, nombre: true, modelo: true },
    orderBy: { nombre: "asc" },
  });
  return equipos.map((e) => ({
    id: e.id,
    nombre: e.nombre || e.modelo || "Sin nombre",
  }));
}

export default async function HistorialPage() {
  const [mantenciones, centros, equipos] = await Promise.all([
    getMantenciones(),
    getCentros(),
    getEquipos(),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Historial de Mantenciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Registro completo de todas las mantenciones realizadas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportGlobalButton />
          <Link
            href="/planificacion"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm hover:shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-calendar"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            Planificación
          </Link>
        </div>
      </div>

      {/* Table with Filters */}
      <HistorialTable
        mantenciones={mantenciones}
        centros={centros}
        equipos={equipos}
      />
    </div>
  );
}
