"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

const ACTIONS = [
  { value: "CREATE", label: "Crear" },
  { value: "UPDATE", label: "Actualizar" },
  { value: "DELETE", label: "Eliminar" },
  { value: "LOGIN", label: "Iniciar sesión" },
  { value: "LOGOUT", label: "Cerrar sesión" },
  { value: "EXECUTE", label: "Ejecutar" },
  { value: "SIGN", label: "Firmar" },
  { value: "CANCEL", label: "Cancelar" },
  { value: "COMPLETE", label: "Completar" },
  { value: "ASSIGN", label: "Asignar" },
  { value: "CHANGE_ROLE", label: "Cambiar rol" },
  { value: "CHANGE_STATUS", label: "Cambiar estado" },
  { value: "RESET_PASSWORD", label: "Reiniciar contraseña" },
  { value: "CHANGE_PERMISSIONS", label: "Cambiar permisos" },
];

const ENTITIES = [
  { value: "User", label: "Usuario" },
  { value: "Mantencion", label: "Mantención" },
  { value: "Equipo", label: "Equipo" },
  { value: "Pauta", label: "Pauta" },
  { value: "Ubicacion", label: "Ubicación" },
  { value: "TipoEquipo", label: "Tipo de Equipo" },
  { value: "Firma", label: "Firma" },
  { value: "Permisos", label: "Permisos" },
  { value: "Session", label: "Sesión" },
];

interface LogsFiltersProps {
  currentAction?: string;
  currentEntity?: string;
  currentStartDate?: string;
  currentEndDate?: string;
}

export default function LogsFilters({
  currentAction,
  currentEntity,
  currentStartDate,
  currentEndDate,
}: LogsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page when filtering
    router.push(`/admin/logs?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/admin/logs");
  };

  const hasFilters =
    currentAction || currentEntity || currentStartDate || currentEndDate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 mb-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">Filtros de Búsqueda</span>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Acción */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Acción
          </label>
          <div className="relative">
            <select
              value={currentAction || ""}
              onChange={(e) => updateFilter("action", e.target.value || null)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-slate-900 dark:focus:border-slate-600 transition-all appearance-none text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="">Todas las acciones</option>
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Entidad */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Entidad
          </label>
          <div className="relative">
            <select
              value={currentEntity || ""}
              onChange={(e) => updateFilter("entity", e.target.value || null)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-slate-900 dark:focus:border-slate-600 transition-all appearance-none text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="">Todas las entidades</option>
              {ENTITIES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Fecha inicio */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Desde
          </label>
          <input
            type="date"
            value={currentStartDate || ""}
            onChange={(e) => updateFilter("startDate", e.target.value || null)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-slate-900 dark:focus:border-slate-600 transition-all text-slate-700 dark:text-slate-200 font-medium"
          />
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Hasta
          </label>
          <input
            type="date"
            value={currentEndDate || ""}
            onChange={(e) => updateFilter("endDate", e.target.value || null)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-slate-900 dark:focus:border-slate-600 transition-all text-slate-700 dark:text-slate-200 font-medium"
          />
        </div>
      </div>
    </div>
  );
}
