"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  type:
    | "menu"
    | "equipo"
    | "establecimiento"
    | "reciente"
    | "pauta"
    | "mantencion";
  label: string;
  href: string;
  section?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  imageUrl?: string | null;
  meta?: string;
}

const menuOptions = [
  { label: "Inicio", href: "/", section: "Principal" },
  { label: "Calendario", href: "/planificacion", section: "Principal" },
  { label: "Nueva Orden", href: "/mantenciones/nueva", section: "Principal" },
  {
    label: "Pendientes",
    href: "/mantenciones/pendientes",
    section: "Principal",
  },
  { label: "Inventario Equipos", href: "/equipos", section: "Activos" },
  { label: "Ubicaciones", href: "/ubicaciones", section: "Activos" },
  { label: "Reportes", href: "/analitica", section: "Reportes" },
  { label: "Usuarios", href: "/admin/usuarios", section: "Ajustes" },
];

interface NavbarSearchProps {
  centros?: string[];
}

export default function NavbarSearch({ centros = [] }: NavbarSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing recent searches", e);
      }
    }
  }, []);

  const saveRecentSearch = (result: SearchResult) => {
    const newRecent = [
      { ...result, type: "reciente" as const },
      ...recentSearches.filter((r) => r.href !== result.href),
    ].slice(0, 5);

    setRecentSearches(newRecent);
    localStorage.setItem("recent_searches", JSON.stringify(newRecent));
  };

  const removeRecentSearch = (e: React.MouseEvent, href: string) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter((r) => r.href !== href);
    setRecentSearches(newRecent);
    localStorage.setItem("recent_searches", JSON.stringify(newRecent));
  };

  const searchGeneral = useCallback(async (query: string) => {
    if (!query) return { equipos: [], pautas: [], mantenciones: [] };
    try {
      const response = await fetch(
        `/api/general-search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error buscando:", error);
    }
    return { equipos: [], pautas: [], mantenciones: [] };
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      if (isFocused) {
        setSearchResults(recentSearches);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
      return;
    }

    const query = searchQuery.toLowerCase();

    // 1. Buscar en Menú
    const menuResults: SearchResult[] = menuOptions
      .filter((item) => item.label.toLowerCase().includes(query))
      .map((item) => ({
        type: "menu" as const,
        label: item.label,
        href: item.href,
        section: item.section,
      }));

    // 2. Buscar en Centros
    const centroResults: SearchResult[] = centros
      .filter((c) => c.toLowerCase().includes(query))
      .map((c) => ({
        type: "establecimiento" as const,
        label: c,
        href: `/ubicaciones/${encodeURIComponent(c)}`,
        section: "Establecimientos",
        subtitle: "Ver detalles del centro",
      }));

    let combinedResults = [...menuResults, ...centroResults];
    setSearchResults(combinedResults);
    setShowResults(true);

    setIsSearching(true);
    const debounce = setTimeout(async () => {
      const { equipos, pautas, mantenciones } = await searchGeneral(
        searchQuery
      );

      const equipoResults: SearchResult[] = (equipos || []).map(
        (equipo: any) => ({
          type: "equipo" as const,
          label: equipo.nombre,
          href: `/equipos/${equipo.id}`,
          subtitle: `${equipo.ubicacion?.establecimiento || ""} · ${
            equipo.tipoEquipo?.subcategoria || ""
          }`,
          imageUrl: equipo.imageUrl,
        })
      );

      const pautaResults: SearchResult[] = (pautas || []).map((pauta: any) => ({
        type: "pauta" as const,
        label: pauta.nombre,
        href: `/pautas/${pauta.id}`,
        subtitle: `Código: ${pauta.codigo} · v${pauta.version}`,
      }));

      const mantencionResults: SearchResult[] = (mantenciones || []).map(
        (mant: any) => ({
          type: "mantencion" as const,
          label: `Folio #${mant.folio}`,
          href: `/mantenciones/${mant.id}/visualizar`,
          subtitle: `${mant.equipo?.nombre} · ${new Date(
            mant.fecha
          ).toLocaleDateString()}`,
          meta: mant.estadoMantencion,
        })
      );

      combinedResults = [
        ...menuResults,
        ...centroResults,
        ...mantencionResults,
        ...pautaResults,
        ...equipoResults,
      ];
      setSearchResults(combinedResults);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchGeneral, centros, isFocused, recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (!searchQuery && recentSearches.length > 0) {
      setSearchResults(recentSearches);
      setShowResults(true);
    } else if (searchQuery) {
      setShowResults(true);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(result);
    router.push(result.href);
    setSearchQuery("");
    setShowResults(false);
    setIsFocused(false);
  };

  const hasResults = searchResults.length > 0;
  const isRecentView = !searchQuery && hasResults;

  const displayResults: SearchResult[] = hasResults
    ? searchResults
    : menuOptions.map((m) => ({
        ...m,
        type: "menu" as const,
      }));

  const showSuggestionsFallback =
    !hasResults && searchQuery.length > 0 && !isSearching;

  return (
    <>
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            onClick={() => {
              setIsFocused(false);
              setShowResults(false);
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        className={`w-full h-[46px] transition-all duration-300 ${
          isFocused ? "block" : "hidden"
        }`}
      />

      <motion.div
        ref={searchRef}
        layout
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className={`
            ${
              isFocused
                ? "fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-2xl"
                : "relative w-full z-30"
            }
        `}
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
            {isSearching ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className={`h-5 w-5 transition-colors ${
                  isFocused
                    ? "text-blue-500"
                    : "text-slate-400 group-hover:text-slate-500"
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
            )}
          </div>

          <motion.input
            ref={inputRef}
            type="text"
            placeholder={
              isFocused ? "Busca folios, pautas, equipos..." : "Buscar..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            className={`
              w-full pl-12 pr-12 text-sm !rounded-full border outline-none transition-all duration-300 ease-spring
              ${
                isFocused
                  ? "bg-white dark:bg-slate-900 border-blue-500 ring-4 ring-blue-500/20 shadow-2xl text-lg h-14 py-4"
                  : "bg-slate-100 dark:bg-slate-800/50 border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-[46px] py-3"
              }
            `}
          />

          {!searchQuery && !isFocused && (
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-700 rounded-full border border-stone-200 dark:border-slate-600 shadow-sm">
                Ctrl K
              </kbd>
            </div>
          )}

          <AnimatePresence>
            {isFocused && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  if (!recentSearches.length) setShowResults(false);
                  else {
                    setSearchResults(recentSearches);
                    setShowResults(true);
                  }
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
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
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800"
            >
              {showSuggestionsFallback && (
                <div className="px-5 py-3 text-sm text-slate-500 italic bg-slate-50/50 dark:bg-slate-900">
                  No encontramos &quot;{searchQuery}&quot;. Pruebe con estas
                  opciones:
                </div>
              )}

              {isRecentView && (
                <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Recientes</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentSearches([]);
                      localStorage.removeItem("recent_searches");
                      setSearchResults([]);
                    }}
                    className="text-blue-500 hover:underline text-[10px]"
                  >
                    Borrar historial
                  </button>
                </div>
              )}

              {displayResults
                .filter((r) => r.type === "mantencion")
                .map((result, i) => (
                  <button
                    key={result.href + i}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group relative"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {result.label}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                          {result.meta}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {result.subtitle}
                      </p>
                    </div>
                    {isRecentView && (
                      <div
                        onClick={(e) => removeRecentSearch(e, result.href)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
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
                      </div>
                    )}
                  </button>
                ))}

              {displayResults
                .filter((r) => r.type === "pauta")
                .map((result, i) => (
                  <button
                    key={result.href + i}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group relative"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {result.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {result.subtitle}
                      </p>
                    </div>
                    {isRecentView && (
                      <div
                        onClick={(e) => removeRecentSearch(e, result.href)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
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
                      </div>
                    )}
                  </button>
                ))}

              {displayResults
                .filter((r) => r.type === "establecimiento")
                .map((result, i) => (
                  <button
                    key={result.href + i}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group relative"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {result.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {result.subtitle}
                      </p>
                    </div>
                    {isRecentView && (
                      <div
                        onClick={(e) => removeRecentSearch(e, result.href)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                        title="Eliminar del historial"
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
                      </div>
                    )}
                  </button>
                ))}

              {displayResults
                .filter((r) => r.type === "equipo")
                .map((result, i) => (
                  <button
                    key={result.href + i}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-4 transition-colors group"
                  >
                    {result.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 dark:border-slate-700 shrink-0 bg-white shadow-sm">
                        <Image
                          src={result.imageUrl}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-transparent">
                        <svg
                          className="w-6 h-6"
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
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {result.label}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    {isRecentView && (
                      <div
                        onClick={(e) => removeRecentSearch(e, result.href)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
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
                      </div>
                    )}
                  </button>
                ))}

              {displayResults.filter((r) =>
                ["menu", "reciente"].includes(r.type)
              ).length > 0 && (
                <div className="py-2 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isRecentView ? "Historial de Navegación" : "Navegación"}
                  </div>
                  <div
                    className={
                      isRecentView ? "" : "grid grid-cols-2 gap-2 px-3"
                    }
                  >
                    {displayResults
                      .filter((r) => ["menu", "reciente"].includes(r.type))
                      .map((result, i) => {
                        if (
                          [
                            "equipo",
                            "establecimiento",
                            "pauta",
                            "mantencion",
                          ].includes(result.type)
                        )
                          return null;
                        return (
                          <button
                            key={result.href + i}
                            onClick={() => handleResultClick(result)}
                            className={`text-left px-3 py-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors group ${
                              isRecentView ? "w-full" : ""
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                                result.type === "reciente"
                                  ? "bg-stone-200 dark:bg-slate-600 text-slate-500"
                                  : "bg-slate-200 dark:bg-slate-600 text-slate-500"
                              }`}
                            >
                              {result.type === "reciente" ? (
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
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              )}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-300 flex-1 truncate">
                              {result.label}
                            </span>

                            {isRecentView && (
                              <div
                                onClick={(e) =>
                                  removeRecentSearch(e, result.href)
                                }
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
