"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

type Equipo = {
  id: string;
  nombre: string;
  modelo: string | null;
  marca: string | null;
  serie: string | null;
  inventario: string | null;
  estado: string;
  periodicidad: string | null;
  imageUrl: string | null;
  tipoEquipo: {
    id: string;
    subcategoria: string;
    categoria: string;
  };
  ubicacion: {
    establecimiento: string;
    area: string;
  };
  pautaAsignada?: {
    id: string;
    nombre: string;
    periodicidadBase: string;
  } | null;
  mantenciones?: {
    id: string;
    fecha: Date;
    tipoMantencion: string;
    estadoMantencion: string;
  }[];
};

interface EquipmentGridProps {
  equipos: Equipo[];
  equiposPorEstablecimiento: Record<string, Equipo[]>;
}

const getEstadoConfig = (estado: string) => {
  switch (estado) {
    case "OPERATIVO":
      return {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
        label: "Operativo",
        icon: "✓",
      };
    case "NO_OPERATIVO":
      return {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
        label: "No Operativo",
        icon: "⚠",
      };
    case "FUERA_SERVICIO":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        dot: "bg-red-500",
        label: "Fuera de Servicio",
        icon: "✗",
      };
    case "DE_BAJA":
      return {
        bg: "bg-zinc-100 dark:bg-slate-800",
        text: "text-zinc-600 dark:text-slate-400",
        dot: "bg-zinc-400",
        label: "De Baja",
        icon: "⛔",
      };
    default:
      return {
        bg: "bg-zinc-100 dark:bg-slate-800",
        text: "text-zinc-600 dark:text-slate-400",
        dot: "bg-zinc-400",
        label: estado,
        icon: "?",
      };
  }
};

// Calcular próxima mantención basado en periodicidad y última mantención
const calcularProximaMantencion = (
  ultimaMantencion: Date | null,
  periodicidad: string | null
): {
  fecha: Date | null;
  estado: "vencido" | "proximo" | "ok" | "sin_dato";
} => {
  if (!ultimaMantencion || !periodicidad) {
    return { fecha: null, estado: "sin_dato" };
  }

  const mesesPorPeriodicidad: Record<string, number> = {
    MENSUAL: 1,
    BIMESTRAL: 2,
    TRIMESTRAL: 3,
    SEMESTRAL: 6,
    ANUAL: 12,
    NO_APLICA: 0,
  };

  const meses = mesesPorPeriodicidad[periodicidad];
  if (!meses) return { fecha: null, estado: "sin_dato" };

  const proxima = new Date(ultimaMantencion);
  proxima.setMonth(proxima.getMonth() + meses);

  const hoy = new Date();
  const diasHastaProxima = Math.ceil(
    (proxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasHastaProxima < 0) {
    return { fecha: proxima, estado: "vencido" };
  } else if (diasHastaProxima <= 30) {
    return { fecha: proxima, estado: "proximo" };
  }
  return { fecha: proxima, estado: "ok" };
};

const formatPeriodicidad = (periodicidad: string | null) => {
  const nombres: Record<string, string> = {
    MENSUAL: "Mensual",
    BIMESTRAL: "Bimestral",
    TRIMESTRAL: "Trimestral",
    SEMESTRAL: "Semestral",
    ANUAL: "Anual",
    NO_APLICA: "No aplica",
  };
  return periodicidad ? nombres[periodicidad] || periodicidad : "Sin definir";
};

export default function EquipmentGrid({
  equipos,
  equiposPorEstablecimiento,
}: EquipmentGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"nombre" | "estado" | "proxima">(
    "nombre"
  );
  const [filterMantencion, setFilterMantencion] = useState<
    "todos" | "vencido" | "proximo" | "sin_dato"
  >("todos");

  // Filtrar equipos por búsqueda y filtros
  const equiposFiltrados = useMemo(() => {
    let filtered = equipos.filter((equipo) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        equipo.nombre.toLowerCase().includes(searchLower) ||
        equipo.modelo?.toLowerCase().includes(searchLower) ||
        equipo.marca?.toLowerCase().includes(searchLower) ||
        equipo.serie?.toLowerCase().includes(searchLower) ||
        equipo.tipoEquipo.subcategoria.toLowerCase().includes(searchLower) ||
        equipo.ubicacion.establecimiento.toLowerCase().includes(searchLower) ||
        equipo.ubicacion.area.toLowerCase().includes(searchLower);

      // Filtro por estado de mantención
      if (filterMantencion !== "todos") {
        const periodicidad =
          equipo.pautaAsignada?.periodicidadBase || equipo.periodicidad;
        const ultimaFecha = equipo.mantenciones?.[0]?.fecha
          ? new Date(equipo.mantenciones[0].fecha)
          : null;
        const proxima = calcularProximaMantencion(ultimaFecha, periodicidad);
        if (proxima.estado !== filterMantencion) {
          return false;
        }
      }

      return matchSearch;
    });

    // Ordenar
    if (sortBy === "nombre") {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortBy === "estado") {
      const orden = ["NO_OPERATIVO", "FUERA_SERVICIO", "DE_BAJA", "OPERATIVO"];
      filtered.sort(
        (a, b) => orden.indexOf(a.estado) - orden.indexOf(b.estado)
      );
    } else if (sortBy === "proxima") {
      filtered.sort((a, b) => {
        const periA = a.pautaAsignada?.periodicidadBase || a.periodicidad;
        const periB = b.pautaAsignada?.periodicidadBase || b.periodicidad;
        const fechaA = a.mantenciones?.[0]?.fecha
          ? new Date(a.mantenciones[0].fecha)
          : null;
        const fechaB = b.mantenciones?.[0]?.fecha
          ? new Date(b.mantenciones[0].fecha)
          : null;
        const proxA = calcularProximaMantencion(fechaA, periA);
        const proxB = calcularProximaMantencion(fechaB, periB);

        const ordenEstado = { vencido: 0, proximo: 1, ok: 2, sin_dato: 3 };
        return ordenEstado[proxA.estado] - ordenEstado[proxB.estado];
      });
    }

    return filtered;
  }, [equipos, searchTerm, sortBy, filterMantencion]);

  // Estadísticas de mantenciones
  const statsMantencion = useMemo(() => {
    let vencidos = 0;
    let proximos = 0;
    let sinDato = 0;

    equipos.forEach((equipo) => {
      const periodicidad =
        equipo.pautaAsignada?.periodicidadBase || equipo.periodicidad;
      const ultimaFecha = equipo.mantenciones?.[0]?.fecha
        ? new Date(equipo.mantenciones[0].fecha)
        : null;
      const proxima = calcularProximaMantencion(ultimaFecha, periodicidad);

      if (proxima.estado === "vencido") vencidos++;
      else if (proxima.estado === "proximo") proximos++;
      else if (proxima.estado === "sin_dato") sinDato++;
    });

    return { vencidos, proximos, sinDato };
  }, [equipos]);

  if (equipos.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-sm font-mono">
        <div className="p-4 bg-zinc-100 dark:bg-slate-800 rounded-xl w-fit mx-auto mb-4">
          <svg
            className="w-10 h-10 text-zinc-400 dark:text-slate-500"
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
        <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100">
          No hay equipos
        </h3>
        <p className="text-zinc-500 dark:text-slate-400 mt-1 font-medium">
          No se encontraron equipos con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y controles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-zinc-400 dark:text-slate-500"
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
              placeholder="Buscar por nombre, modelo, marca, serie, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-900"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Filtros y ordenamiento */}
          <div className="flex flex-wrap gap-2">
            {/* Filtro por estado de mantención */}
            <select
              value={filterMantencion}
              onChange={(e) =>
                setFilterMantencion(e.target.value as typeof filterMantencion)
              }
              className="px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-zinc-900 dark:text-slate-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600"
            >
              <option value="todos">Todas las mantenciones</option>
              <option value="vencido">
                🔴 Vencidas ({statsMantencion.vencidos})
              </option>
              <option value="proximo">
                🟡 Próximas ({statsMantencion.proximos})
              </option>
              <option value="sin_dato">
                ⚪ Sin datos ({statsMantencion.sinDato})
              </option>
            </select>

            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-zinc-900 dark:text-slate-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-slate-600"
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="estado">Ordenar por estado</option>
              <option value="proxima">Ordenar por mantención</option>
            </select>

            {/* Toggle View Mode */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-zinc-900 dark:bg-slate-700 text-white"
                    : "text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200"
                }`}
                title="Vista cuadrícula"
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-zinc-900 dark:bg-slate-700 text-white"
                    : "text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200"
                }`}
                title="Vista lista"
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-zinc-900 dark:bg-slate-700 text-white"
                    : "text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200"
                }`}
                title="Vista tabla"
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
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-zinc-500 dark:text-slate-400 font-medium">
            {equiposFiltrados.length} de {equipos.length} equipos
            {searchTerm && (
              <span className="text-zinc-400">
                {" "}
                · Buscando: &quot;{searchTerm}&quot;
              </span>
            )}
          </p>
          {filterMantencion !== "todos" && (
            <button
              onClick={() => setFilterMantencion("todos")}
              className="text-zinc-900 dark:text-slate-200 hover:text-zinc-700 dark:hover:text-slate-100 flex items-center gap-1 font-medium"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {equiposFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-sm">
          <svg
            className="w-12 h-12 text-zinc-400 dark:text-slate-600 mx-auto mb-4"
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
          <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100">
            Sin resultados
          </h3>
          <p className="text-zinc-500 dark:text-slate-400 mt-1 font-medium">
            No se encontraron equipos que coincidan con tu búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterMantencion("todos");
            }}
            className="mt-4 text-zinc-900 dark:text-slate-200 hover:text-zinc-700 dark:hover:text-slate-100 font-bold"
          >
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View - Mejorado con más información
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equiposFiltrados.map((equipo) => {
            const estadoConfig = getEstadoConfig(equipo.estado);
            const periodicidad =
              equipo.pautaAsignada?.periodicidadBase || equipo.periodicidad;
            const ultimaFecha = equipo.mantenciones?.[0]?.fecha
              ? new Date(equipo.mantenciones[0].fecha)
              : null;
            const proximaMantencion = calcularProximaMantencion(
              ultimaFecha,
              periodicidad
            );

            return (
              <Link
                key={equipo.id}
                href={`/equipos/${equipo.id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 overflow-hidden hover:border-zinc-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200"
              >
                {/* Image Preview */}
                <div className="aspect-video bg-zinc-100 dark:bg-slate-800 relative overflow-hidden">
                  {equipo.imageUrl ? (
                    <img
                      src={equipo.imageUrl}
                      alt={equipo.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="p-6 bg-zinc-200/50 rounded-xl">
                        <svg
                          className="w-10 h-10 text-zinc-400 dark:text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Estado Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${estadoConfig.bg} ${estadoConfig.text} backdrop-blur-sm`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`}
                      ></span>
                      {estadoConfig.label}
                    </span>
                  </div>

                  {/* Indicador de mantención */}
                  {proximaMantencion.estado !== "sin_dato" && (
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold backdrop-blur-sm ${
                          proximaMantencion.estado === "vencido"
                            ? "bg-red-500 text-white"
                            : proximaMantencion.estado === "proximo"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {proximaMantencion.estado === "vencido"
                          ? "Vencida"
                          : proximaMantencion.estado === "proximo"
                          ? "Próxima"
                          : "Al día"}
                      </span>
                    </div>
                  )}

                  {/* Tipo Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-zinc-900 dark:text-slate-100 backdrop-blur-sm shadow-sm">
                      {equipo.tipoEquipo.subcategoria}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-zinc-900 dark:text-slate-100 group-hover:text-zinc-700 dark:group-hover:text-slate-300 transition-colors line-clamp-1">
                    {equipo.nombre}
                  </h3>

                  {/* Modelo y Marca */}
                  <div className="mt-1 space-y-0.5">
                    {(equipo.marca || equipo.modelo) && (
                      <p className="text-sm text-zinc-500 dark:text-slate-400 line-clamp-1">
                        {equipo.marca && (
                          <span className="font-semibold">{equipo.marca}</span>
                        )}
                        {equipo.marca && equipo.modelo && " · "}
                        {equipo.modelo}
                      </p>
                    )}
                    {equipo.serie && (
                      <p className="text-xs text-zinc-400 dark:text-slate-500">
                        Serie: <span className="font-mono">{equipo.serie}</span>
                      </p>
                    )}
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-slate-800">
                    <svg
                      className="w-4 h-4 text-zinc-400 dark:text-slate-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-xs text-zinc-500 dark:text-slate-400 line-clamp-1">
                      {equipo.ubicacion.establecimiento} ·{" "}
                      {equipo.ubicacion.area}
                    </span>
                  </div>

                  {/* Info de Mantenciones */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-slate-800 space-y-2">
                    {/* Periodicidad */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 dark:text-slate-500 font-medium">
                        Periodicidad:
                      </span>
                      <span
                        className={`font-bold ${
                          periodicidad
                            ? "text-zinc-700 dark:text-slate-300"
                            : "text-zinc-400 dark:text-slate-500"
                        }`}
                      >
                        {formatPeriodicidad(periodicidad)}
                      </span>
                    </div>

                    {/* Última mantención */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 dark:text-slate-500">
                        Última:
                      </span>
                      <span
                        className={`font-medium ${
                          ultimaFecha
                            ? "text-zinc-700 dark:text-slate-300"
                            : "text-zinc-400 dark:text-slate-500"
                        }`}
                      >
                        {ultimaFecha
                          ? new Date(ultimaFecha).toLocaleDateString("es-CL")
                          : "Sin registro"}
                      </span>
                    </div>

                    {/* Próxima mantención */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 dark:text-slate-500">
                        Próxima:
                      </span>
                      <span
                        className={`font-medium ${
                          proximaMantencion.estado === "vencido"
                            ? "text-red-600"
                            : proximaMantencion.estado === "proximo"
                            ? "text-amber-600"
                            : proximaMantencion.estado === "ok"
                            ? "text-emerald-600"
                            : "text-zinc-400"
                        }`}
                      >
                        {proximaMantencion.fecha
                          ? new Date(
                              proximaMantencion.fecha
                            ).toLocaleDateString("es-CL")
                          : "Sin definir"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : viewMode === "list" ? (
        // List View - Agrupado por establecimiento
        <div className="space-y-6">
          {Object.entries(
            equiposFiltrados.reduce((acc, equipo) => {
              const est = equipo.ubicacion.establecimiento;
              if (!acc[est]) acc[est] = [];
              acc[est].push(equipo);
              return acc;
            }, {} as Record<string, Equipo[]>)
          ).map(([establecimiento, equiposEst]) => (
            <div
              key={establecimiento}
              className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-zinc-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Header del establecimiento */}
              <div className="bg-linear-to-r from-zinc-100 to-zinc-50 dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-zinc-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-200 dark:bg-slate-700 rounded-2xl">
                    <svg
                      className="w-5 h-5 text-zinc-700 dark:text-slate-300"
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
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-slate-100">
                      {establecimiento}
                    </h2>
                    <p className="text-zinc-600 dark:text-slate-400 text-sm">
                      {equiposEst.length} equipos
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de equipos */}
              <div className="divide-y divide-zinc-100 dark:divide-slate-800">
                {equiposEst.map((equipo) => {
                  const estadoConfig = getEstadoConfig(equipo.estado);
                  const periodicidad =
                    equipo.pautaAsignada?.periodicidadBase ||
                    equipo.periodicidad;
                  const ultimaFecha = equipo.mantenciones?.[0]?.fecha
                    ? new Date(equipo.mantenciones[0].fecha)
                    : null;
                  const proximaMantencion = calcularProximaMantencion(
                    ultimaFecha,
                    periodicidad
                  );

                  return (
                    <Link
                      key={equipo.id}
                      href={`/equipos/${equipo.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-none bg-zinc-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
                        {equipo.imageUrl ? (
                          <img
                            src={equipo.imageUrl}
                            alt={equipo.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-zinc-400 dark:text-slate-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                              />
                            </svg>
                          </div>
                        )}
                        {/* Indicador de mantención pequeño */}
                        {proximaMantencion.estado !== "sin_dato" &&
                          proximaMantencion.estado !== "ok" && (
                            <div
                              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                proximaMantencion.estado === "vencido"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                              }`}
                            />
                          )}
                      </div>

                      {/* Info */}
                      <div className="grow min-w-0">
                        <h3 className="font-medium text-zinc-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {equipo.nombre}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-none bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {equipo.tipoEquipo.subcategoria}
                          </span>
                          <span className="text-zinc-400 dark:text-slate-600">
                            ·
                          </span>
                          <span className="text-zinc-600 dark:text-slate-400">
                            {equipo.ubicacion.area}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
                          {equipo.marca && (
                            <span className="font-medium">{equipo.marca}</span>
                          )}
                          {equipo.marca && equipo.modelo && " · "}
                          {equipo.modelo}
                          {equipo.serie && ` | Serie: ${equipo.serie}`}
                        </p>
                      </div>

                      {/* Estado, Mantención y Fecha */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Próxima mantención */}
                        <div className="text-right text-xs hidden lg:block">
                          <p className="text-zinc-500 dark:text-slate-400">
                            Próxima mantención
                          </p>
                          <p
                            className={`font-medium ${
                              proximaMantencion.estado === "vencido"
                                ? "text-red-600"
                                : proximaMantencion.estado === "proximo"
                                ? "text-amber-600"
                                : proximaMantencion.estado === "ok"
                                ? "text-emerald-600"
                                : "text-zinc-400 dark:text-slate-500"
                            }`}
                          >
                            {proximaMantencion.fecha
                              ? new Date(
                                  proximaMantencion.fecha
                                ).toLocaleDateString("es-CL")
                              : "Sin definir"}
                          </p>
                        </div>

                        {equipo.mantenciones?.[0] && (
                          <div className="text-right text-xs text-zinc-500 dark:text-slate-400 hidden md:block">
                            <p>Última mantención</p>
                            <p className="font-medium text-zinc-700 dark:text-slate-300">
                              {new Date(
                                equipo.mantenciones[0].fecha
                              ).toLocaleDateString("es-CL")}
                            </p>
                          </div>
                        )}

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`}
                          ></span>
                          {estadoConfig.label}
                        </span>

                        <svg
                          className="w-5 h-5 text-zinc-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors"
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
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-zinc-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-slate-800 border-b border-zinc-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Periodicidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Última Mant.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Próxima Mant.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {equiposFiltrados.map((equipo) => {
                  const estadoConfig = getEstadoConfig(equipo.estado);
                  const periodicidad =
                    equipo.pautaAsignada?.periodicidadBase ||
                    equipo.periodicidad;
                  const ultimaFecha = equipo.mantenciones?.[0]?.fecha
                    ? new Date(equipo.mantenciones[0].fecha)
                    : null;
                  const proximaMantencion = calcularProximaMantencion(
                    ultimaFecha,
                    periodicidad
                  );

                  return (
                    <tr
                      key={equipo.id}
                      className="hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-none bg-zinc-100 dark:bg-slate-800 overflow-hidden shrink-0">
                            {equipo.imageUrl ? (
                              <img
                                src={equipo.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-zinc-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-slate-100 truncate">
                              {equipo.nombre}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-slate-400 truncate">
                              {equipo.marca && `${equipo.marca} · `}
                              {equipo.modelo}
                              {equipo.serie && ` · S/N: ${equipo.serie}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-zinc-900 dark:text-slate-100">
                          {equipo.ubicacion.establecimiento}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-slate-400">
                          {equipo.ubicacion.area}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-none text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`}
                          ></span>
                          {estadoConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-slate-300">
                        {formatPeriodicidad(periodicidad)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-slate-300">
                        {ultimaFecha ? (
                          new Date(ultimaFecha).toLocaleDateString("es-CL")
                        ) : (
                          <span className="text-zinc-400 dark:text-slate-500">
                            Sin registro
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            proximaMantencion.estado === "vencido"
                              ? "text-red-600"
                              : proximaMantencion.estado === "proximo"
                              ? "text-amber-600"
                              : proximaMantencion.estado === "ok"
                              ? "text-emerald-600"
                              : "text-zinc-400 dark:text-slate-500"
                          }`}
                        >
                          {proximaMantencion.fecha
                            ? new Date(
                                proximaMantencion.fecha
                              ).toLocaleDateString("es-CL")
                            : "Sin definir"}
                        </span>
                        {proximaMantencion.estado === "vencido" && (
                          <span className="ml-2 text-xs text-red-500">
                            ⚠️ Vencida
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/equipos/${equipo.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-slate-200 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 rounded-none transition-colors"
                        >
                          Ver
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
