import Link from "next/link";
import { getEquipo } from "../../actions";
import { notFound } from "next/navigation";
import EquipoImage from "./components/EquipoImage";
import EquipoActions from "./EquipoActions";
import { getCurrentUser } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

const getEstadoEquipoConfig = (estado: string) => {
  switch (estado) {
    case "OPERATIVO":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Operativo",
      };
    case "NO_OPERATIVO":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "No Operativo",
      };
    case "FUERA_SERVICIO":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Fuera de Servicio",
      };
    case "DE_BAJA":
      return { bg: "bg-red-100", text: "text-red-700", label: "⛔ De Baja" };
    default:
      return { bg: "bg-zinc-100", text: "text-zinc-600", label: estado };
  }
};

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
    case "PROGRAMADA":
      return {
        bg: "bg-purple-100",
        text: "text-purple-700",
        label: "Programada",
      };
    default:
      return { bg: "bg-zinc-100", text: "text-zinc-600", label: estado };
  }
};

export default async function EquipoDetailPage({ params }: Props) {
  const { id } = await params;
  const [equipo, user] = await Promise.all([getEquipo(id), getCurrentUser()]);
  const userRole = user?.rol || "VISUALIZADOR";

  if (!equipo) {
    notFound();
  }

  const estadoConfig = getEstadoEquipoConfig(equipo.estado);
  const canEdit = userRole === "ADMINISTRADOR" || userRole === "REGISTRADOR";

  // Agrupar mantenciones por año
  const mantencionesPorAnio = equipo.mantenciones.reduce((acc, mant) => {
    const anio = new Date(mant.fecha).getFullYear();
    if (!acc[anio]) {
      acc[anio] = [];
    }
    acc[anio].push(mant);
    return acc;
  }, {} as Record<number, typeof equipo.mantenciones>);

  const completadas = equipo.mantenciones.filter(
    (m) => m.estadoMantencion === "COMPLETADA"
  ).length;
  const pendientes = equipo.mantenciones.filter(
    (m) =>
      m.estadoMantencion === "PENDIENTE" || m.estadoMantencion === "EN_PROCESO"
  ).length;

  // Última mantención
  const ultimaMantencion = equipo.mantenciones.find(
    (m) => m.estadoMantencion === "COMPLETADA"
  );

  // Próxima mantención pendiente
  const proximaMantencion = equipo.mantenciones.find(
    (m) =>
      m.estadoMantencion === "PENDIENTE" || m.estadoMantencion === "EN_PROCESO"
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link
              href="/equipos"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
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
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100">
                  {equipo.nombre}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${estadoConfig.bg} ${estadoConfig.text}`}
                >
                  {estadoConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-zinc-600 dark:text-slate-400">
                <span>{equipo.tipoEquipo.subcategoria}</span>
                <span className="text-zinc-300 dark:text-slate-600">·</span>
                <span>{equipo.modelo}</span>
                <span className="text-zinc-300 dark:text-slate-600">·</span>
                <span>
                  Serie: <strong>{equipo.serie || "N/A"}</strong>
                </span>
              </div>
            </div>
          </div>
          <EquipoActions
            equipoId={equipo.id}
            equipoNombre={equipo.nombre}
            mantencionesCont={equipo.mantenciones.length}
            userRole={userRole}
            equipoEstado={equipo.estado}
          />
        </div>

        {/* Banner de equipo de baja */}
        {equipo.estado === "DE_BAJA" && (
          <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-900">
                  Equipo dado de baja
                </p>
                <p className="text-sm text-red-700">
                  Este equipo está marcado como DE BAJA. No se pueden planificar
                  nuevas mantenciones.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pauta Asignada + Stats en una fila */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Pauta Asignada - Card destacada */}
          <div
            className={`lg:col-span-2 rounded-3xl shadow-sm border overflow-hidden ${
              equipo.pautaAsignada
                ? "bg-gradient-to-r from-blue-600 to-blue-700 border-blue-700"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      equipo.pautaAsignada
                        ? "bg-white/20"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        equipo.pautaAsignada
                          ? "text-white"
                          : "text-zinc-400 dark:text-slate-500"
                      }`}
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
                  </div>
                  <div>
                    <p
                      className={`text-xs uppercase tracking-wide ${
                        equipo.pautaAsignada
                          ? "text-blue-200"
                          : "text-zinc-500 dark:text-slate-400"
                      }`}
                    >
                      Pauta Asignada
                    </p>
                    {equipo.pautaAsignada ? (
                      <>
                        <p className="text-lg font-bold text-white mt-0.5">
                          {equipo.pautaAsignada.nombre}
                        </p>
                        <p className="text-sm text-blue-200">
                          {equipo.pautaAsignada.codigo} ·{" "}
                          {equipo.pautaAsignada._count?.items || 0} items
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-medium text-zinc-400 dark:text-slate-500 mt-0.5">
                        Sin pauta asignada
                      </p>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <Link
                    href={`/equipos/${equipo.id}/editar`}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-full transition-colors ${
                      equipo.pautaAsignada
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {equipo.pautaAsignada ? "Cambiar" : "Asignar"}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats compactos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Completadas
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {completadas}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Pendientes
              </p>
              <p className="text-2xl font-bold text-amber-600">{pendientes}</p>
            </div>
          </div>
        </div>

        {/* Alertas de mantención */}
        {proximaMantencion && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-2xl">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-amber-900">
                    Mantención{" "}
                    {proximaMantencion.estadoMantencion === "EN_PROCESO"
                      ? "en proceso"
                      : "pendiente"}
                  </p>
                  <p className="text-sm text-amber-700">
                    {proximaMantencion.pauta?.nombre || "Sin pauta"} ·{" "}
                    {new Date(proximaMantencion.fecha).toLocaleDateString(
                      "es-CL",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </p>
                </div>
              </div>
              <Link
                href={`/mantenciones/${proximaMantencion.id}/visualizar`}
                className="px-6 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-full hover:bg-amber-700 transition-colors shadow-sm"
              >
                {proximaMantencion.estadoMantencion === "PENDIENTE"
                  ? "Ejecutar"
                  : "Ver"}
              </Link>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Imagen + Info rápida */}
          <div className="lg:col-span-1 space-y-4">
            {/* Imagen del equipo */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-1">
              <EquipoImage
                equipoId={equipo.id}
                imageUrl={equipo.imageUrl}
                nombre={equipo.nombre}
              />
            </div>

            {/* Resumen rápido */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-slate-500 uppercase tracking-wider mb-3">
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-slate-400">
                    Total mantenciones
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-slate-100">
                    {equipo.mantenciones.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-slate-400">
                    Última mantención
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-slate-100">
                    {ultimaMantencion
                      ? new Date(ultimaMantencion.fecha).toLocaleDateString(
                          "es-CL",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-slate-400">
                    Periodicidad
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-slate-100">
                    {equipo.pautaAsignada?.periodicidadBase ||
                      equipo.periodicidad ||
                      "No definida"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Info detallada */}
          <div className="lg:col-span-2 space-y-4">
            {/* Info del equipo */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Información del Equipo
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-zinc-400 dark:text-slate-500 uppercase tracking-wider">
                      Ubicación
                    </label>
                    <p className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                      {equipo.ubicacion.establecimiento}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-slate-400">
                      {equipo.ubicacion.area}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-zinc-400 dark:text-slate-500 uppercase tracking-wider">
                      Tipo
                    </label>
                    <p className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                      {equipo.tipoEquipo.subcategoria}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-slate-400">
                      {equipo.tipoEquipo.codigo}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 dark:text-slate-500 uppercase tracking-wider">
                      Marca
                    </label>
                    <p className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                      {equipo.marca || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 dark:text-slate-500 uppercase tracking-wider">
                      Modelo
                    </label>
                    <p className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                      {equipo.modelo || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 dark:text-slate-500 uppercase tracking-wider">
                      Serie
                    </label>
                    <p className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                      {equipo.serie || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 dark:text-slate-500 uppercase tracking-wider">
                      Inventario
                    </label>
                    <p className="font-medium text-zinc-900 dark:text-slate-100 mt-0.5">
                      {equipo.inventario || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de mantenciones - dentro del grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-slate-100 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-slate-600 dark:text-slate-400"
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
                  Historial de Mantenciones
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500 dark:text-slate-400">
                    {equipo.mantenciones.length} registros
                  </span>
                  {equipo.mantenciones.length > 0 && (
                    <Link
                      href={`/equipos/${equipo.id}/historial`}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors flex items-center gap-1"
                    >
                      Ver más
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              {equipo.mantenciones.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="p-3 bg-zinc-100 dark:bg-slate-800 rounded-none w-fit mx-auto mb-3">
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
                  <p className="text-sm text-zinc-500 dark:text-slate-400">
                    Sin mantenciones registradas
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
                  {equipo.mantenciones.slice(0, 10).map((mant) => {
                    const mantEstado = getEstadoMantencionConfig(
                      mant.estadoMantencion
                    );
                    return (
                      <Link
                        key={mant.id}
                        href={`/mantenciones/${mant.id}/visualizar`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-full ${mantEstado.bg}`}>
                            <svg
                              className={`w-4 h-4 ${mantEstado.text}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {mant.estadoMantencion === "COMPLETADA" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              ) : mant.estadoMantencion === "EN_PROCESO" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              )}
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {mant.pauta?.nombre ||
                                `Mantención ${
                                  mant.tipoMantencion === "PREVENTIVO"
                                    ? "Preventiva"
                                    : "Correctiva"
                                }`}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-slate-400">
                              {new Date(mant.fecha).toLocaleDateString(
                                "es-CL",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                              {mant.realizadoPor &&
                                ` · ${mant.realizadoPor.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${mantEstado.bg} ${mantEstado.text}`}
                          >
                            {mantEstado.label}
                          </span>
                          <svg
                            className="w-4 h-4 text-zinc-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {equipo.mantenciones.length > 10 && (
                <div className="px-5 py-3 border-t border-zinc-100 dark:border-slate-800 bg-zinc-50 dark:bg-slate-800/30">
                  <Link
                    href={`/equipos/${equipo.id}/historial`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    Ver más
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
