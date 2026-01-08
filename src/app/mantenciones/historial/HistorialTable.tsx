"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Mantencion {
  id: string;
  fecha: Date;
  estadoMantencion: string;
  tipoMantencion: string;
  equipo: {
    id: string;
    nombre: string;
    modelo: string | null;
    serie: string | null;
    tipoEquipo: {
      subcategoria: string;
    } | null;
    ubicacion: {
      area: string;
      establecimiento: string;
    } | null;
  } | null;
  realizadoPor: {
    name: string | null;
  } | null;
  firmas: {
    id: string;
    role: string;
    nombreFirmante: string;
    cargoFirmante: string | null;
  }[];
}

interface HistorialTableProps {
  mantenciones: Mantencion[];
  centros: string[];
  equipos: { id: string; nombre: string }[];
}

export default function HistorialTable({
  mantenciones,
  centros,
  equipos,
}: HistorialTableProps) {
  const searchParams = useSearchParams();

  // Inicializar filtros desde URL params
  const [filters, setFilters] = useState({
    fechaDesde: "",
    fechaHasta: "",
    equipo: "",
    centro: "",
    tipo: "",
    estado: searchParams.get("estado") || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Si hay filtros en URL, mostrar panel de filtros
  useEffect(() => {
    if (searchParams.get("estado")) {
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filtrar mantenciones
  const filteredMantenciones = useMemo(() => {
    return mantenciones.filter((m) => {
      // Filtro por fecha desde
      if (filters.fechaDesde) {
        const fechaDesde = new Date(filters.fechaDesde);
        if (new Date(m.fecha) < fechaDesde) return false;
      }

      // Filtro por fecha hasta
      if (filters.fechaHasta) {
        const fechaHasta = new Date(filters.fechaHasta);
        fechaHasta.setHours(23, 59, 59);
        if (new Date(m.fecha) > fechaHasta) return false;
      }

      // Filtro por equipo
      if (filters.equipo && m.equipo?.id !== filters.equipo) return false;

      // Filtro por centro
      if (
        filters.centro &&
        m.equipo?.ubicacion?.establecimiento !== filters.centro
      )
        return false;

      // Filtro por tipo
      if (filters.tipo && m.tipoMantencion !== filters.tipo) return false;

      // Filtro por estado
      if (filters.estado && m.estadoMantencion !== filters.estado) return false;

      return true;
    });
  }, [mantenciones, filters]);

  const clearFilters = () => {
    setFilters({
      fechaDesde: "",
      fechaHasta: "",
      equipo: "",
      centro: "",
      tipo: "",
      estado: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case "COMPLETADA":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          label: "Completada",
        };
      case "EN_PROCESO":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          label: "En Proceso",
        };
      case "PENDIENTE":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          label: "Pendiente",
        };
      case "CANCELADA":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Cancelada",
        };
      default:
        return {
          bg: "bg-zinc-100",
          text: "text-zinc-600",
          label: estado,
        };
    }
  };

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case "PREVENTIVO":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
        };
      case "CORRECTIVO":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
        };
      default:
        return {
          bg: "bg-zinc-100",
          text: "text-zinc-600",
        };
    }
  };

  // Estadísticas filtradas
  const stats = {
    total: filteredMantenciones.length,
    completadas: filteredMantenciones.filter(
      (m) => m.estadoMantencion === "COMPLETADA"
    ).length,
    enProceso: filteredMantenciones.filter(
      (m) => m.estadoMantencion === "EN_PROCESO"
    ).length,
    pendientes: filteredMantenciones.filter(
      (m) => m.estadoMantencion === "PENDIENTE"
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Registros",
            value: stats.total,
            icon: (
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
                className="lucide lucide-clipboard-list"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
            ),
            color: "blue",
          },
          {
            label: "Completadas",
            value: stats.completadas,
            icon: (
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
                className="lucide lucide-check-circle-2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            ),
            color: "emerald",
          },
          {
            label: "En Proceso",
            value: stats.enProceso,
            icon: (
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
                className="lucide lucide-timer"
              >
                <line x1="10" x2="14" y1="2" y2="2" />
                <line x1="12" x2="15" y1="14" y2="11" />
                <circle cx="12" cy="14" r="8" />
              </svg>
            ),
            color: "sky",
          },
          {
            label: "Pendientes",
            value: stats.pendientes,
            icon: (
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
                className="lucide lucide-clock"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            color: "amber",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-slate-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  stat.color === "blue"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : stat.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : stat.color === "sky"
                    ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                }`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toggle & Active Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-medium text-sm ${
            showFilters || hasActiveFilters
              ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-filter"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full ml-1">
              {Object.values(filters).filter((v) => v !== "").length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 18 12" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 animate-fadeIn shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {/* Fecha Desde */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) =>
                  setFilters({ ...filters, fechaDesde: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) =>
                  setFilters({ ...filters, fechaHasta: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Equipo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Equipo
              </label>
              <select
                value={filters.equipo}
                onChange={(e) =>
                  setFilters({ ...filters, equipo: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="">Todos</option>
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Centro */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Centro
              </label>
              <select
                value={filters.centro}
                onChange={(e) =>
                  setFilters({ ...filters, centro: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="">Todos</option>
                {centros.map((centro) => (
                  <option key={centro} value={centro}>
                    {centro}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) =>
                  setFilters({ ...filters, tipo: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="">Todos</option>
                <option value="PREVENTIVO">Preventivo</option>
                <option value="CORRECTIVO">Correctivo</option>
              </select>
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) =>
                  setFilters({ ...filters, estado: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="">Todos</option>
                <option value="COMPLETADA">Completada</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {hasActiveFilters && (
        <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
          Mostrando{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {filteredMantenciones.length}
          </span>{" "}
          de {mantenciones.length} mantenciones
        </p>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        {filteredMantenciones.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-fit mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-search text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sin resultados
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No se encontraron mantenciones con los filtros actuales."
                : "Aún no hay registros de mantención en el sistema."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16"></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Centro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Autorizó
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                {filteredMantenciones.map((mantencion, index) => {
                  const estadoConfig = getEstadoConfig(
                    mantencion.estadoMantencion
                  );
                  const tipoConfig = getTipoConfig(mantencion.tipoMantencion);
                  const firmaResponsable = mantencion.firmas?.find(
                    (f) => f.role === "RESPONSABLE"
                  );
                  const firmaTecnico = mantencion.firmas?.find(
                    (f) => f.role === "TECNICO"
                  );

                  return (
                    <tr
                      key={mantencion.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Visualizar Button */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/mantenciones/${mantencion.id}/visualizar`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-all shadow-sm"
                          title="Visualizar Detalle"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye"
                          >
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-calendar"
                            >
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="4"
                                rx="2"
                                ry="2"
                              />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {new Date(mantencion.fecha).toLocaleDateString(
                                "es-CL",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(mantencion.fecha).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Equipo */}
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col max-w-[220px]">
                          <span
                            className="font-medium truncate"
                            title={mantencion.equipo?.nombre}
                          >
                            {mantencion.equipo?.nombre || "Sin nombre"}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            {mantencion.equipo?.modelo || "Sin modelo"}
                          </span>
                        </div>
                      </td>

                      {/* Centro */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {mantencion.equipo?.ubicacion?.establecimiento ||
                              "-"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {mantencion.equipo?.ubicacion?.area || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            mantencion.tipoMantencion === "PREVENTIVO"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                              : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                          }`}
                        >
                          {mantencion.tipoMantencion}
                        </span>
                      </td>

                      {/* Técnico */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {firmaTecnico ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-white dark:border-slate-700 ring-1 ring-gray-100 dark:ring-slate-700">
                              {firmaTecnico.nombreFirmante.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {firmaTecnico.nombreFirmante.split(" ")[0]}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                Tech
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Autorizó */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {firmaResponsable ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-white dark:border-slate-700">
                              {firmaResponsable.nombreFirmante.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {firmaResponsable.nombreFirmante.split(" ")[0]}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                Resp
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs italic">
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            mantencion.estadoMantencion === "COMPLETADA"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                              : mantencion.estadoMantencion === "EN_PROCESO"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                              : mantencion.estadoMantencion === "CANCELADA"
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              mantencion.estadoMantencion === "COMPLETADA"
                                ? "bg-emerald-500"
                                : mantencion.estadoMantencion === "EN_PROCESO"
                                ? "bg-blue-500"
                                : mantencion.estadoMantencion === "CANCELADA"
                                ? "bg-red-500"
                                : "bg-amber-500"
                            }`}
                          ></span>
                          {estadoConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer (Simple) */}
        {filteredMantenciones.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando registros más recientes primero
            </span>
            {/* Pagination controls could go here */}
          </div>
        )}
      </div>
    </div>
  );
}
