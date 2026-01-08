"use client";

import { useState } from "react";
import { deleteChecklistRecord, updateChecklistRecord } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminActionsProps {
  id: number;
  record: any; // Pass the full record for editing
}

export default function AdminActions({ id, record }: AdminActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fecha: new Date(record.fecha).toISOString().split("T")[0],
    observaciones: record.observaciones || "",
    tecnicoNombre: record.tecnicoNombre || "",
    tecnicoRut: record.tecnicoRut || "",
    items: record.items.map((item: any) => ({
      itemTemplateId: item.itemTemplateId,
      descripcion: item.itemTemplate.descripcion,
      completado: item.completado,
    })),
  });

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteChecklistRecord(String(id));
      toast.success("Registro eliminado correctamente");
      router.push("/mantenciones/historial");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el registro");
    } finally {
      setLoading(false);
    }
  };

  const isSigned = !!record.firmaFecha;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateChecklistRecord(String(id), editData);
      toast.success("Registro actualizado correctamente");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el registro");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const newItems = [...editData.items];
    newItems[index].completado = !newItems[index].completado;
    setEditData({ ...editData, items: newItems });
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {isSigned ? "Editar Mantención (Admin)" : "Rellenar Información"}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUpdate} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Mantención
              </label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={editData.fecha}
                onChange={(e) =>
                  setEditData({ ...editData, fecha: e.target.value })
                }
                required
              />
            </div>

            {/* Technician Info - Only show if not signed or admin */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Técnico
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editData.tecnicoNombre}
                  onChange={(e) =>
                    setEditData({ ...editData, tecnicoNombre: e.target.value })
                  }
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT Técnico
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editData.tecnicoRut}
                  onChange={(e) =>
                    setEditData({ ...editData, tecnicoRut: e.target.value })
                  }
                  placeholder="Ej: 12.345.678-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items de Chequeo
              </label>
              <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                {editData.items.map((item: any, index: number) => (
                  <label
                    key={index}
                    className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={item.completado}
                      onChange={() => toggleItem(index)}
                    />
                    <span className="text-sm text-gray-700">
                      {item.descripcion}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                rows={4}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={editData.observaciones}
                onChange={(e) =>
                  setEditData({ ...editData, observaciones: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
      >
        {isSigned ? "Editar (Admin)" : "Rellenar Información"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {loading ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  );
}
