import Link from "next/link";
import { getEquipos, getEstablecimientos, getTiposEquipo } from "../actions";
import EquipmentGrid from "./components/EquipmentGrid";
import BulkImportButton from "./components/BulkImportButton";
import { getCurrentUser } from "@/lib/auth";

export default async function EquiposPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    establecimiento?: string;
    tipo?: string;
    categoria?: string;
  }>;
}) {
  const params = await searchParams;
  const [equipos, establecimientos, tipos, user] = await Promise.all([
    getEquipos({
      search: params.search,
      establecimiento: params.establecimiento,
      tipoEquipoId: params.tipo,
    }),
    getEstablecimientos(),
    getTiposEquipo(),
    getCurrentUser(),
  ]);

  const userRole = user?.rol || "VISUALIZADOR";
  const canCreate = userRole === "ADMINISTRADOR" || userRole === "REGISTRADOR";

  // Agrupar por categoría
  const equiposPorCategoria = equipos.reduce((acc, equipo) => {
    const cat = equipo.tipoEquipo.categoria;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(equipo);
    return acc;
  }, {} as Record<string, typeof equipos>);

  // Agrupar por establecimiento (para vista alternativa)
  const equiposPorEstablecimiento = equipos.reduce((acc, equipo) => {
    const est = equipo.ubicacion.establecimiento;
    if (!acc[est]) {
      acc[est] = [];
    }
    acc[est].push(equipo);
    return acc;
  }, {} as Record<string, typeof equipos>);

  // Obtener categorías únicas del schema
  const categorias = Array.from(new Set(tipos.map((t) => t.categoria))).sort();

  // Helper para formatear nombres de categorías
  const formatCategoria = (categoria: string) => {
    const nombres: Record<string, string> = {
      AIRE_ACONDICIONADO: "Aire Acondicionado",
      AMBULANCIA: "Ambulancia",
      CALDERA: "Caldera",
      CAMILLA: "Camilla",
      CAMION: "Camión",
      EQUIPO_MEDICO: "Equipo Médico",
      INSTRUMENTAL: "Instrumental",
      MOBILIARIO: "Mobiliario",
      VEHICULO: "Vehículo",
    };
    return (
      nombres[categoria] ||
      categoria
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ")
    );
  };

  // Filtrar equipos si hay categoría seleccionada
  const equiposFiltrados = params.categoria
    ? equipos.filter((e) => e.tipoEquipo.categoria === params.categoria)
    : equipos;

  const equiposPorEstablecimientoFiltrado = equiposFiltrados.reduce(
    (acc, equipo) => {
      const est = equipo.ubicacion.establecimiento;
      if (!acc[est]) {
        acc[est] = [];
      }
      acc[est].push(equipo);
      return acc;
    },
    {} as Record<string, typeof equipos>
  );

  // Estadísticas
  const operativos = equipos.filter((e) => e.estado === "OPERATIVO").length;
  const noOperativos = equipos.filter(
    (e) => e.estado === "NO_OPERATIVO"
  ).length;
  const fueraServicio = equipos.filter(
    (e) => e.estado === "FUERA_SERVICIO" || e.estado === "DE_BAJA"
  ).length;

  return (
    <div className="p-6 space-y-6 bg-zinc-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
            Equipos
          </h1>
          <p className="text-zinc-500 dark:text-slate-400 mt-1 font-medium">
            {params.categoria
              ? `Categoría: ${formatCategoria(params.categoria)} · ${
                  equiposFiltrados.length
                } equipos`
              : "Gestión y seguimiento de equipos médicos"}
          </p>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            <BulkImportButton />
            <Link
              href="/equipos/nuevo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-slate-800 text-white rounded-xl hover:bg-zinc-800 dark:hover:bg-slate-700 transition-colors shadow-sm font-bold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nuevo Equipo
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-zinc-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-100 dark:bg-slate-800 rounded-xl">
              <svg
                className="w-5 h-5 text-zinc-700 dark:text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-slate-400 uppercase tracking-wide font-bold">
                Total
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-slate-100">
                {equipos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-zinc-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
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
              <p className="text-xs text-zinc-500 dark:text-slate-400 uppercase tracking-wide font-bold">
                Operativos
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {operativos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-zinc-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-slate-400 uppercase tracking-wide font-bold">
                No Operativos
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {noOperativos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-zinc-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-slate-400 uppercase tracking-wide font-bold">
                Establecimientos
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(equiposPorEstablecimiento).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías - Navegación rápida */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
          Filtrar por Categoría
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/equipos"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              !params.categoria
                ? "bg-zinc-900 dark:bg-slate-700 text-white"
                : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-slate-700 hover:text-zinc-900 dark:hover:text-slate-200"
            }`}
          >
            Todas ({equipos.length})
          </Link>
          {categorias.map((categoria) => {
            const count = equiposPorCategoria[categoria]?.length || 0;
            const categoriaLabel = formatCategoria(categoria);

            return (
              <Link
                key={categoria}
                href={`/equipos?categoria=${categoria}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  params.categoria === categoria
                    ? "bg-zinc-900 dark:bg-slate-700 text-white"
                    : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-slate-700 hover:text-zinc-900 dark:hover:text-slate-200"
                }`}
              >
                {categoriaLabel} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 p-5 shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-slate-300 mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Nombre, modelo o serie..."
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-slate-300 mb-1.5">
              Categoría
            </label>
            <select
              name="categoria"
              defaultValue={params.categoria}
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-zinc-900 dark:text-slate-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600 focus:border-transparent"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {formatCategoria(cat)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-slate-300 mb-1.5">
              Establecimiento
            </label>
            <select
              name="establecimiento"
              defaultValue={params.establecimiento}
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-zinc-900 dark:text-slate-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600 focus:border-transparent"
            >
              <option value="">Todos</option>
              {establecimientos.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-slate-300 mb-1.5">
              Tipo de Equipo
            </label>
            <select
              name="tipo"
              defaultValue={params.tipo}
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-zinc-900 dark:text-slate-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600 focus:border-transparent"
            >
              <option value="">Todos</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.subcategoria}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-zinc-900 dark:bg-slate-800 text-white rounded-xl hover:bg-zinc-800 dark:hover:bg-slate-700 transition-colors font-bold"
            >
              Aplicar Filtros
            </button>
          </div>
        </form>
      </div>

      <EquipmentGrid
        equipos={equiposFiltrados}
        equiposPorEstablecimiento={equiposPorEstablecimientoFiltrado}
      />
    </div>
  );
}
