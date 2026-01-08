"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

export default function EquipmentFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`/equipos?${params.toString()}`);
    setIsSearching(false);
  }, 300);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "TODOS") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/equipos?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm mb-6 border border-zinc-200 dark:border-zinc-700 animate-slide-down">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative group">
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              isSearching
                ? "text-blue-500 animate-pulse-subtle"
                : "text-zinc-400 group-focus-within:text-blue-500"
            }`}
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
          <input
            type="text"
            placeholder="Buscar por nombre, marca, modelo..."
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            defaultValue={searchParams.get("search")?.toString()}
            onChange={(e) => {
              setIsSearching(true);
              handleSearch(e.target.value);
            }}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-4 h-4 animate-spin text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full md:w-auto appearance-none pl-4 pr-10 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-shadow"
              defaultValue={searchParams.get("tipo")?.toString() || "TODOS"}
              onChange={(e) => handleFilterChange("tipo", e.target.value)}
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="CALDERA">Caldera</option>
              <option value="GRUPO_ELECTROGENO">Grupo Electrógeno</option>
              <option value="TECHUMBRE">Techumbre</option>
              <option value="CLIMATIZACION">Climatización</option>
              <option value="MANIFOLD_OXIGENO">Manifold Oxígeno</option>
              <option value="OTRO">Otro</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full md:w-auto appearance-none pl-4 pr-10 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-shadow"
              defaultValue={searchParams.get("estado")?.toString() || "TODOS"}
              onChange={(e) => handleFilterChange("estado", e.target.value)}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="EN_MANTENCION">En Mantención</option>
              <option value="BAJA">De Baja</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
