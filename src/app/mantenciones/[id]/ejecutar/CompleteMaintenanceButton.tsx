"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finalizarMantencion } from "@/app/actions/mantenciones";
import { EstadoEquipo } from "@prisma/client";

interface CompleteMaintenanceButtonProps {
  mantencionId: string;
  canComplete: boolean;
  allRequiredCompleted: boolean;
  hasTecnico: boolean;
  hasResponsable: boolean;
}

export default function CompleteMaintenanceButton({
  mantencionId,
  canComplete,
  allRequiredCompleted,
  hasTecnico,
  hasResponsable,
}: CompleteMaintenanceButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [estadoResultante, setEstadoResultante] = useState<EstadoEquipo>(
    EstadoEquipo.OPERATIVO
  );
  const [observaciones, setObservaciones] = useState("");

  const handleComplete = async () => {
    startTransition(async () => {
      try {
        await finalizarMantencion(mantencionId, {
          estadoResultante,
          observaciones: observaciones || undefined,
        });
        router.push(`/mantenciones/${mantencionId}`);
      } catch (error) {
        console.error("Error completing maintenance:", error);
        alert(
          "Error al completar la mantención. Por favor intente nuevamente."
        );
      }
    });
  };

  // Generar mensaje de requisitos faltantes
  const getMissingRequirements = () => {
    const missing = [];
    if (!allRequiredCompleted) missing.push("checklist obligatorio");
    if (!hasTecnico) missing.push("firma del técnico");
    if (!hasResponsable) missing.push("firma del responsable");
    return missing;
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
          Finalizar Mantención
        </h3>

        {!canComplete && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
              Requisitos pendientes:
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
              {getMissingRequirements().map((req, i) => (
                <li key={i}>Falta {req}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          disabled={!canComplete || isPending}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            canComplete
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
          }`}
        >
          {isPending ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
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
              Completando...
            </>
          ) : (
            <>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Completar Mantención
            </>
          )}
        </button>

        {canComplete && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
            Se registrará la fecha y hora de finalización
          </p>
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Completar Mantención
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Confirme el estado final del equipo
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Estado resultante */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Estado resultante del equipo
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      value: EstadoEquipo.OPERATIVO,
                      label: "Operativo",
                      color: "green",
                    },
                    {
                      value: EstadoEquipo.NO_OPERATIVO,
                      label: "No Operativo",
                      color: "red",
                    },
                    {
                      value: EstadoEquipo.FUERA_SERVICIO,
                      label: "Fuera de Servicio",
                      color: "zinc",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        estadoResultante === option.value
                          ? option.color === "green"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : option.color === "red"
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-zinc-500 bg-zinc-50 dark:bg-zinc-900/20"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="estadoResultante"
                        value={option.value}
                        checked={estadoResultante === option.value}
                        onChange={(e) =>
                          setEstadoResultante(e.target.value as EstadoEquipo)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          estadoResultante === option.value
                            ? option.color === "green"
                              ? "border-green-500"
                              : option.color === "red"
                              ? "border-red-500"
                              : "border-zinc-500"
                            : "border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {estadoResultante === option.value && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              option.color === "green"
                                ? "bg-green-500"
                                : option.color === "red"
                                ? "bg-red-500"
                                : "bg-zinc-500"
                            }`}
                          />
                        )}
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Observaciones adicionales */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Observaciones finales (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese observaciones adicionales sobre la mantención..."
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    Procesando...
                  </>
                ) : (
                  "Confirmar y Completar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
