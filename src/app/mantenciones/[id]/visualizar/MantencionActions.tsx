"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMantencion } from "@/app/actions/mantenciones";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

interface MantencionActionsProps {
  mantencionId: string;
  equipoNombre: string;
  equipoId: string;
  estado: string;
  isAdmin?: boolean;
  tieneFirmas?: boolean;
}

export default function MantencionActions({
  mantencionId,
  equipoNombre,
  equipoId,
  estado,
  isAdmin = false,
  tieneFirmas = false,
}: MantencionActionsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete = isAdmin || estado !== "COMPLETADA";
  const isCompletadaConFirmas = estado === "COMPLETADA" && tieneFirmas;

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("No tienes permisos para eliminar esta mantención");
      return;
    }

    try {
      setDeleting(true);
      const forceDelete = isAdmin && estado === "COMPLETADA";
      await deleteMantencion(mantencionId, forceDelete);
      toast.success("Mantención eliminada");
      router.push(`/equipos/${equipoId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {/* Icon-only Delete Button */}
      {canDelete && (
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar mantención"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Eliminar Mantención
              </h3>
            </div>

            <p className="text-slate-600 mb-2">
              ¿Estás seguro de que deseas eliminar esta mantención del equipo{" "}
              <strong>{equipoNombre}</strong>?
            </p>

            {isAdmin && isCompletadaConFirmas && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Advertencia:</strong> Esta mantención está
                  completada y tiene firmas digitales. Al eliminarla se borrarán
                  todas las firmas y datos asociados.
                </p>
              </div>
            )}

            <p className="text-sm text-slate-500 mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
