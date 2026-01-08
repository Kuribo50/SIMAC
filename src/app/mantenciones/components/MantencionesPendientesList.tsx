"use client";

import { useState } from "react";
import Link from "next/link";
import AsignarPautaModal from "./AsignarPautaModal";
import CambiarPautaButton from "./CambiarPautaButton";
import { EstadoMantencion, TipoMantencion } from "@prisma/client";

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  _count?: {
    items: number;
  };
}

interface Mantencion {
  id: string;
  fecha: Date;
  estadoMantencion: EstadoMantencion;
  tipoMantencion: TipoMantencion;
  equipo: {
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
  pauta: {
    id: string;
    nombre: string;
    _count?: {
      items: number;
    };
  } | null;
  respuestas: { isCompleted: boolean }[];
  firmas: unknown[];
}

interface MantencionesPendientesListProps {
  mantenciones: Mantencion[];
  pautas: Pauta[];
}

export default function MantencionesPendientesList({
  mantenciones,
  pautas,
}: MantencionesPendientesListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMantencion, setSelectedMantencion] = useState<{
    id: string;
    equipoNombre: string;
  } | null>(null);

  const getEstadoBadge = (estado: EstadoMantencion) => {
    const badges: Record<
      EstadoMantencion,
      { bg: string; text: string; label: string }
    > = {
      PENDIENTE: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-300",
        label: "Pendiente",
      },
      EN_PROCESO: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        label: "En Proceso",
      },
      COMPLETADA: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        label: "Completada",
      },
      CANCELADA: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        label: "Cancelada",
      },
    };
    const badge = badges[estado];
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const getTipoBadge = (tipo: TipoMantencion) => {
    const badges: Record<TipoMantencion, { bg: string; text: string }> = {
      PREVENTIVO: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-300",
      },
      CORRECTIVO: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-300",
      },
    };
    const badge = badges[tipo];
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {tipo}
      </span>
    );
  };

  const handleOpenModal = (mantencion: Mantencion) => {
    setSelectedMantencion({
      id: mantencion.id,
      equipoNombre: `${mantencion.equipo?.modelo || "Sin equipo"} - ${
        mantencion.equipo?.serie || ""
      }`,
    });
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {mantenciones.map((mantencion, index) => {
          const totalItems = mantencion.pauta?._count?.items || 0;
          const completedItems = mantencion.respuestas.length;
          const progress =
            totalItems > 0
              ? Math.round((completedItems / totalItems) * 100)
              : 0;
          const hasFirmas = mantencion.firmas.length > 0;
          const isOverdue = new Date(mantencion.fecha) < new Date();

          return (
            <div
              key={mantencion.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                isOverdue &&
                mantencion.estadoMantencion === EstadoMantencion.PENDIENTE
                  ? "border-red-300 dark:border-red-900 shadow-red-100 dark:shadow-none"
                  : "border-slate-200 dark:border-slate-800"
              } overflow-hidden hover:shadow-lg transition-all duration-200`}
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          mantencion.estadoMantencion ===
                          EstadoMantencion.EN_PROCESO
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-amber-100 dark:bg-amber-900/30"
                        }`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            mantencion.estadoMantencion ===
                            EstadoMantencion.EN_PROCESO
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {mantencion.equipo?.modelo || "Sin equipo"} -{" "}
                            {mantencion.equipo?.serie || ""}
                          </h3>
                          {getEstadoBadge(mantencion.estadoMantencion)}
                          {getTipoBadge(mantencion.tipoMantencion)}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {mantencion.equipo?.tipoEquipo?.subcategoria ||
                            "Tipo no especificado"}{" "}
                          •{" "}
                          {mantencion.equipo?.ubicacion
                            ? `${mantencion.equipo.ubicacion.area} - ${mantencion.equipo.ubicacion.establecimiento}`
                            : "Sin ubicación"}
                        </p>
                        {mantencion.pauta ? (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Pauta:</span>{" "}
                              {mantencion.pauta.nombre}
                            </p>
                            <CambiarPautaButton
                              mantencionId={mantencion.id}
                              pautaActualId={mantencion.pauta.id}
                              pautaActualNombre={mantencion.pauta.nombre}
                              pautas={pautas}
                              variant="link"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(mantencion)}
                            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
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
                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Sin pauta - Asignar ahora
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fecha y progreso */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                    {/* Fecha */}
                    <div className="text-center px-4">
                      <p
                        className={`text-xs font-medium mb-1 ${
                          isOverdue &&
                          mantencion.estadoMantencion ===
                            EstadoMantencion.PENDIENTE
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {isOverdue &&
                        mantencion.estadoMantencion ===
                          EstadoMantencion.PENDIENTE
                          ? "ATRASADA"
                          : "PROGRAMADA"}
                      </p>
                      <p
                        className={`font-semibold ${
                          isOverdue &&
                          mantencion.estadoMantencion ===
                            EstadoMantencion.PENDIENTE
                            ? "text-red-700 dark:text-red-400"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {new Date(mantencion.fecha).toLocaleDateString(
                          "es-CL",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {/* Progreso */}
                    {mantencion.pauta && (
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400">
                            Progreso
                          </span>
                          <span
                            className={`font-medium transition-colors ${
                              progress === 100
                                ? "text-emerald-600"
                                : progress > 50
                                ? "text-blue-600"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full transition-all duration-500 ease-out ${
                              progress === 100
                                ? "bg-emerald-500"
                                : progress > 50
                                ? "bg-blue-500"
                                : progress > 0
                                ? "bg-amber-500"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                          {completedItems}/{totalItems} ítems
                        </p>
                      </div>
                    )}

                    {/* Indicadores */}
                    <div className="flex items-center gap-2">
                      {hasFirmas && (
                        <span
                          className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl"
                          title="Tiene firmas"
                        >
                          <svg
                            className="w-5 h-5 text-green-600"
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
                        </span>
                      )}
                    </div>

                    {/* Botón de acción */}
                    {mantencion.pauta ? (
                      <Link
                        href={`/mantenciones/${mantencion.id}/visualizar`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm font-medium text-sm whitespace-nowrap"
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
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Ejecutar
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(mantencion)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-sm font-medium text-sm whitespace-nowrap"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Asignar Pauta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para asignar pauta */}
      {selectedMantencion && (
        <AsignarPautaModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedMantencion(null);
          }}
          mantencionId={selectedMantencion.id}
          equipoNombre={selectedMantencion.equipoNombre}
          pautas={pautas}
        />
      )}
    </>
  );
}
