import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ anio?: string }>;
}

const getEstadoMantencionConfig = (estado: string) => {
  switch (estado) {
    case "COMPLETADA":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Completada",
      };
    case "PENDIENTE":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "Pendiente" };
    case "EN_PROCESO":
      return { bg: "bg-blue-100", text: "text-blue-700", label: "En Proceso" };
    case "CANCELADA":
      return { bg: "bg-red-100", text: "text-red-700", label: "Cancelada" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", label: estado };
  }
};

async function getEquipoConMantenciones(id: string) {
  return prisma.equipo.findUnique({
    where: { id },
    include: {
      ubicacion: true,
      tipoEquipo: true,
      pautaAsignada: true,
      mantenciones: {
        include: {
          pauta: true,
          realizadoPor: true,
          firmas: {
            orderBy: { firmadoEn: "asc" },
          },
        },
        orderBy: { fecha: "desc" },
      },
    },
  });
}

export default async function EquipoHistorialPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { anio } = await searchParams;

  const equipo = await getEquipoConMantenciones(id);

  if (!equipo) {
    notFound();
  }

  // Agrupar mantenciones por año
  const mantencionesPorAnio = equipo.mantenciones.reduce((acc, mant) => {
    const year = new Date(mant.fecha).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(mant);
    return acc;
  }, {} as Record<number, typeof equipo.mantenciones>);

  const aniosDisponibles = Object.keys(mantencionesPorAnio)
    .map(Number)
    .sort((a, b) => b - a);

  const anioSeleccionado = anio ? parseInt(anio) : aniosDisponibles[0];
  const mantencionesFiltradas = anioSeleccionado
    ? mantencionesPorAnio[anioSeleccionado] || []
    : equipo.mantenciones;

  const completadas = equipo.mantenciones.filter(
    (m) => m.estadoMantencion === "COMPLETADA"
  ).length;
  const pendientes = equipo.mantenciones.filter(
    (m) =>
      m.estadoMantencion === "PENDIENTE" || m.estadoMantencion === "EN_PROCESO"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link
            href={`/equipos/${id}`}
            className="p-2 text-zinc-600 hover:text-zinc-900 bg-white rounded-none shadow-sm border border-zinc-200"
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              Historial de Mantenciones
            </h1>
            <p className="text-zinc-600 mt-1">
              {equipo.nombre} · {equipo.tipoEquipo.subcategoria}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
              Total
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {equipo.mantenciones.length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
              Completadas
            </p>
            <p className="text-3xl font-bold text-emerald-600">{completadas}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
              Pendientes
            </p>
            <p className="text-3xl font-bold text-amber-600">{pendientes}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
              Pauta Asignada
            </p>
            <p className="text-base font-bold text-blue-600 truncate">
              {equipo.pautaAsignada?.codigo || "Sin pauta"}
            </p>
          </div>
        </div>

        {/* Filtro por año */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="font-bold text-slate-900">Filtrar por Año</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/equipos/${id}/historial`}
                className={`px-4 py-1.5 text-sm rounded-full transition-all border ${
                  !anio
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                Todos
              </Link>
              {aniosDisponibles.map((year) => (
                <Link
                  key={year}
                  href={`/equipos/${id}/historial?anio=${year}`}
                  className={`px-4 py-1.5 text-sm rounded-full transition-all border ${
                    anioSeleccionado === year && anio
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {year}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de mantenciones - Tabla completa */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              {anio
                ? `Mantenciones ${anioSeleccionado}`
                : "Todas las Mantenciones"}
              <span className="text-slate-500 font-normal text-sm">
                ({mantencionesFiltradas.length})
              </span>
            </h2>
          </div>

          {mantencionesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-3 bg-zinc-100 rounded-none w-fit mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-zinc-500">
                No hay mantenciones{" "}
                {anio ? `en ${anioSeleccionado}` : "registradas"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Folio
                    </th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Pauta
                    </th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Realizado por
                    </th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Autorizado por
                    </th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center font-bold text-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mantencionesFiltradas.map((mant) => {
                    const estadoConfig = getEstadoMantencionConfig(
                      mant.estadoMantencion
                    );
                    const firmaTecnico = mant.firmas?.find(
                      (f: any) => f.role === "TECNICO"
                    );
                    const firmaResponsable = mant.firmas?.find(
                      (f: any) => f.role === "RESPONSABLE"
                    );

                    return (
                      <tr
                        key={mant.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Folio */}
                        <td className="px-6 py-4">
                          {mant.folio ? (
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              #{mant.folio.toString().padStart(4, "0")}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">
                              Sin folio
                            </span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">
                              {new Date(mant.fecha).toLocaleDateString(
                                "es-CL",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(mant.fecha).toLocaleDateString(
                                "es-CL",
                                {
                                  weekday: "long",
                                }
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Pauta */}
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            {mant.pauta ? (
                              <>
                                <span className="font-medium text-zinc-900 block truncate">
                                  {mant.pauta.nombre}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">
                                  {mant.pauta.codigo}
                                </span>
                              </>
                            ) : (
                              <span className="text-zinc-400 italic">
                                Sin pauta
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              mant.tipoMantencion === "PREVENTIVO"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {mant.tipoMantencion === "PREVENTIVO"
                              ? "Preventiva"
                              : "Correctiva"}
                          </span>
                        </td>

                        {/* Realizado por (Técnico) */}
                        <td className="px-4 py-3">
                          {firmaTecnico ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-900">
                                {firmaTecnico.nombreFirmante}
                              </span>
                              {firmaTecnico.cargoFirmante && (
                                <span className="text-xs text-zinc-500">
                                  {firmaTecnico.cargoFirmante}
                                </span>
                              )}
                            </div>
                          ) : mant.realizadoPor ? (
                            <span className="text-zinc-700">
                              {mant.realizadoPor.name}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">
                              Sin asignar
                            </span>
                          )}
                        </td>

                        {/* Autorizado por (Responsable) */}
                        <td className="px-4 py-3">
                          {firmaResponsable ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-900">
                                {firmaResponsable.nombreFirmante}
                              </span>
                              {firmaResponsable.cargoFirmante && (
                                <span className="text-xs text-zinc-500">
                                  {firmaResponsable.cargoFirmante}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">
                              Pendiente
                            </span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${estadoConfig.bg} ${estadoConfig.text}`}
                          >
                            {estadoConfig.label}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/mantenciones/${mant.id}/visualizar`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 rounded-full transition-all shadow-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
