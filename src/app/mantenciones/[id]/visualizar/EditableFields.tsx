"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditableFieldsProps {
  mantencionId: string;
  fecha: Date;
  equiposDePrueba: string | null;
  periodicidad: string | null;
  estadoMantencion: string;
}

export default function EditableFields({
  mantencionId,
  fecha,
  equiposDePrueba: initialEquipos,
  periodicidad: initialPeriodicidad,
  estadoMantencion,
}: EditableFieldsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fechaValue, setFechaValue] = useState(
    new Date(fecha).toISOString().split("T")[0]
  );
  const [equiposDePrueba, setEquiposDePrueba] = useState(
    initialEquipos || "Tester"
  );
  const [periodicidad, setPeriodicidad] = useState(initialPeriodicidad || "");

  const isCompleted = estadoMantencion === "COMPLETADA";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/mantenciones/actualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mantencionId,
          fecha: fechaValue,
          equiposDePrueba,
          periodicidad,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFechaValue(new Date(fecha).toISOString().split("T")[0]);
    setEquiposDePrueba(initialEquipos || "Tester");
    setPeriodicidad(initialPeriodicidad || "");
    setIsEditing(false);
  };

  if (isCompleted) {
    return null;
  }

  return (
    <div className="print:hidden mb-4">
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Editar datos
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
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
            Editar datos de mantención
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Mantención
              </label>
              <input
                type="date"
                value={fechaValue}
                onChange={(e) => setFechaValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período de Mantención
              </label>
              <select
                value={periodicidad}
                onChange={(e) => setPeriodicidad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="MENSUAL">Mensual</option>
                <option value="TRIMESTRAL">Trimestral</option>
                <option value="SEMESTRAL">Semestral</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipos de Prueba
              </label>
              <input
                type="text"
                value={equiposDePrueba}
                onChange={(e) => setEquiposDePrueba(e.target.value)}
                placeholder="Tester, multímetro, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
