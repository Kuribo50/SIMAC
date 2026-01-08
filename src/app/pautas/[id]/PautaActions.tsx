"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deletePauta, togglePautaActivo } from "@/app/actions/pautas";
import { toast } from "sonner";

interface PautaActionsProps {
  pautaId: string;
  pautaNombre: string;
  activo: boolean;
  mantencionesCont: number;
  userRole?: string;
}

export default function PautaActions({
  pautaId,
  pautaNombre,
  activo,
  mantencionesCont,
  userRole = "VISUALIZADOR",
}: PautaActionsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForceDeleteModal, setShowForceDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Solo ADMINISTRADOR y REGISTRADOR pueden editar/eliminar
  const canEdit = userRole === "ADMINISTRADOR" || userRole === "REGISTRADOR";

  const handleDelete = async (forceDelete: boolean = false) => {
    try {
      setDeleting(true);
      const result = await deletePauta(pautaId, forceDelete);

      // Si la pauta está en uso y no se puede eliminar, se marcó como inactiva
      if (result.cannotDelete) {
        toast.info(
          result.message ||
            `La pauta "${result.pautaNombre}" está en desuso y ha sido marcada como INACTIVA.`,
          {
            duration: 6000,
          }
        );
        setShowDeleteModal(false);
        setShowForceDeleteModal(false);
        router.refresh();
        return;
      }

      if (result.requiresConfirmation) {
        setShowDeleteModal(false);
        setShowForceDeleteModal(true);
        setDeleting(false);
        return;
      }

      toast.success("Pauta eliminada correctamente");
      router.push("/pautas");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la pauta");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setShowForceDeleteModal(false);
    }
  };

  const handleToggleActivo = async () => {
    try {
      setToggling(true);
      await togglePautaActivo(pautaId);
      toast.success(activo ? "Pauta desactivada" : "Pauta activada");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al cambiar el estado");
    } finally {
      setToggling(false);
    }
  };

  // Si no tiene permisos, no mostrar nada
  if (!canEdit) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Botón Toggle Activo */}
        <button
          onClick={handleToggleActivo}
          disabled={toggling}
          className={`px-3 py-2 text-sm rounded-none transition-colors flex items-center gap-2 ${
            activo
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
        >
          {toggling ? (
            <svg
              className="animate-spin h-4 w-4"
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
          ) : (
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
                d={
                  activo
                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              />
            </svg>
          )}
          {activo ? "Desactivar" : "Activar"}
        </button>

        {/* Botón Editar */}
        <Link
          href={`/pautas/${pautaId}/editar`}
          className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-none hover:bg-zinc-800 transition-colors flex items-center gap-2"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Editar
        </Link>

        {/* Botón Eliminar */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors flex items-center gap-2"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Eliminar
        </button>
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-none">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Eliminar Pauta
              </h3>
            </div>

            <p className="text-zinc-600 mb-2">
              ¿Estás seguro de que deseas eliminar la pauta{" "}
              <strong>{pautaNombre}</strong>?
            </p>

            {mantencionesCont > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-none p-3 mb-4">
                <p className="text-sm text-amber-800">
                  ⚠️ Esta pauta tiene {mantencionesCont} mantenciones asociadas.
                  Se le preguntará si desea desasociarlas.
                </p>
              </div>
            )}

            <p className="text-sm text-zinc-500 mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(false)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación forzada */}
      {showForceDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-none">
                <svg
                  className="w-6 h-6 text-amber-600"
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
              <h3 className="text-lg font-semibold text-zinc-900">
                Pauta con Mantenciones
              </h3>
            </div>

            <p className="text-zinc-600 mb-4">
              La pauta <strong>{pautaNombre}</strong> tiene{" "}
              <strong>{mantencionesCont}</strong> mantención(es) asociada(s).
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-none p-3 mb-4">
              <p className="text-sm text-amber-800">
                Si continúa, las mantenciones quedarán sin pauta asignada (no se
                eliminarán).
              </p>
            </div>

            <p className="text-sm text-zinc-500 mb-6">
              ¿Desea desasociar las mantenciones y eliminar la pauta?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForceDeleteModal(false)}
                className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(true)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Eliminando...
                  </>
                ) : (
                  "Desasociar y Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
