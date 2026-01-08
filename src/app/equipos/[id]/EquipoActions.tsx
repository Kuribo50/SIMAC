"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteEquipo } from "@/app/actions/equipos";
import { toast } from "sonner";

interface EquipoActionsProps {
  equipoId: string;
  equipoNombre: string;
  mantencionesCont: number;
  userRole?: string;
  equipoEstado?: string;
}

export default function EquipoActions({
  equipoId,
  equipoNombre,
  mantencionesCont,
  userRole = "VISUALIZADOR",
  equipoEstado = "OPERATIVO",
}: EquipoActionsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Solo ADMINISTRADOR y REGISTRADOR pueden editar/eliminar
  const canEdit = userRole === "ADMINISTRADOR" || userRole === "REGISTRADOR";
  const isDeBaja = equipoEstado === "DE_BAJA";

  const handleDelete = async () => {
    if (mantencionesCont > 0) {
      toast.error(
        `No se puede eliminar: tiene ${mantencionesCont} mantenciones asociadas`
      );
      return;
    }

    try {
      setDeleting(true);
      await deleteEquipo(equipoId);
      toast.success("Equipo eliminado correctamente");
      router.push("/equipos");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el equipo");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Botón Editar - Solo para ADMIN y REGISTRADOR */}
        {canEdit && (
          <Link
            href={`/equipos/${equipoId}/editar`}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all shadow-sm"
            title="Editar Equipo"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
        )}

        {/* Botón Asignar Mantención - Oculto si está DE_BAJA */}
        {!isDeBaja && (
          <Link
            href={`/mantenciones/nueva?equipoId=${equipoId}`}
            className="px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Asignar Mantención
          </Link>
        )}

        {/* Botón Eliminar - Solo para ADMIN y REGISTRADOR */}
        {canEdit && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-full transition-all shadow-sm"
            title="Eliminar Equipo"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
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
              <h3 className="text-lg font-bold text-slate-800">
                Eliminar Equipo
              </h3>
            </div>

            <p className="text-slate-600 mb-2">
              ¿Estás seguro de que deseas eliminar el equipo{" "}
              <strong>{equipoNombre}</strong>?
            </p>

            {mantencionesCont > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ Este equipo tiene {mantencionesCont} mantenciones
                  asociadas. No se puede eliminar.
                </p>
              </div>
            )}

            <p className="text-sm text-slate-500 mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || mantencionesCont > 0}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
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
    </>
  );
}
