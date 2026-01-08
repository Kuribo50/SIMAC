"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Ubicacion {
  id: string;
  area: string;
  establecimiento: string;
}

interface InlineEditableTableProps {
  mantencionId: string;
  equipoNombre: string;
  ubicacion: string;
  ubicacionId: string;
  inventario: string;
  marca: string;
  modelo: string;
  serie: string;
  periodicidad: string | null;
  personalTecnico: string;
  equiposDePrueba: string | null;
  fecha: Date;
  estadoMantencion: string;
  pautaNombre: string | null;
  ubicaciones: Ubicacion[];
}

export default function InlineEditableTable({
  mantencionId,
  equipoNombre,
  ubicacion,
  ubicacionId,
  inventario,
  marca,
  modelo,
  serie,
  periodicidad,
  personalTecnico,
  equiposDePrueba,
  fecha,
  estadoMantencion,
  pautaNombre,
  ubicaciones,
}: InlineEditableTableProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    equipoNombre,
    ubicacionId,
    equiposDePrueba: equiposDePrueba || "",
    fecha: new Date(fecha).toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(false);

  const isCompleted = estadoMantencion === "COMPLETADA";
  const fechaFormatted = new Date(fecha).toLocaleDateString("es-CL");

  const handleSave = async (field: string) => {
    setIsLoading(true);
    try {
      const body: any = { mantencionId };

      switch (field) {
        case "equipoNombre":
          body.equipoNombre = editValues.equipoNombre;
          break;
        case "ubicacion":
          body.ubicacionId = editValues.ubicacionId;
          break;
        case "equiposDePrueba":
          body.equiposDePrueba = editValues.equiposDePrueba;
          break;
        case "fecha":
          body.fecha = editValues.fecha;
          break;
      }

      const response = await fetch("/api/mantenciones/actualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsLoading(false);
      setIsEditing(null);
    }
  };

  const EditIcon = () => (
    <svg
      className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer print:hidden"
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
  );

  const renderEditableCell = (
    field: string,
    label: string,
    value: string,
    type: "text" | "date" | "select" = "text"
  ) => {
    const isCurrentlyEditing = isEditing === field;
    const canEdit =
      !isCompleted &&
      ["equipoNombre", "ubicacion", "equiposDePrueba", "fecha"].includes(field);

    return (
      <div className="flex border-b border-black dark:border-slate-700">
        <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
          {label}
        </div>
        <div className="flex-1 p-1.5 flex items-center justify-between text-xs">
          {isCurrentlyEditing ? (
            <div className="flex-1 flex items-center gap-2">
              {type === "select" ? (
                <select
                  value={editValues.ubicacionId}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      ubicacionId: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  autoFocus
                >
                  {ubicaciones.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.area} - {u.establecimiento}
                    </option>
                  ))}
                </select>
              ) : type === "date" ? (
                <input
                  type="date"
                  value={editValues.fecha}
                  onChange={(e) =>
                    setEditValues({ ...editValues, fecha: e.target.value })
                  }
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={
                    field === "equipoNombre"
                      ? editValues.equipoNombre
                      : editValues.equiposDePrueba
                  }
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      [field === "equipoNombre"
                        ? "equipoNombre"
                        : "equiposDePrueba"]: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  autoFocus
                />
              )}
              <button
                onClick={() => handleSave(field)}
                disabled={isLoading}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
              >
                ✓
              </button>
              <button
                onClick={() => setIsEditing(null)}
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span
                className={
                  field === "fecha" || field === "equipoNombre"
                    ? "font-semibold text-blue-800 dark:text-blue-400"
                    : "dark:text-slate-200"
                }
              >
                {field === "fecha" ? fechaFormatted : value || "-"}
              </span>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(field)}
                  className="ml-2 print:hidden"
                >
                  <EditIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStaticCell = (
    label: string,
    value: string,
    highlight = false
  ) => (
    <div className="flex border-b border-black dark:border-slate-700">
      <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
        {label}
      </div>
      <div
        className={`flex-1 p-1.5 text-xs dark:text-slate-200 ${
          highlight ? "font-semibold text-blue-800 dark:text-blue-400" : ""
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );

  // Renderizar celda doble (dos campos en una fila)
  const renderDoubleCell = (
    label1: string,
    value1: string,
    label2: string,
    value2: string
  ) => (
    <div className="flex border-b border-black dark:border-slate-700">
      <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
        {label1}
      </div>
      <div className="flex-1 p-1.5 text-xs border-r border-black dark:border-slate-700 dark:text-slate-200">
        {value1 || "-"}
      </div>
      <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
        {label2}
      </div>
      <div className="flex-1 p-1.5 text-xs dark:text-slate-200">
        {value2 || "-"}
      </div>
    </div>
  );

  return (
    <div className="border-2 border-black dark:border-slate-700 mb-4 text-xs">
      {/* Nombre de Equipo - Editable */}
      {renderEditableCell("equipoNombre", "Nombre de Equipo", equipoNombre)}

      {/* Ubicación - Editable */}
      <div className="flex border-b border-black dark:border-slate-700">
        <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
          Ubicación
        </div>
        <div className="flex-1 p-1.5 flex items-center justify-between text-xs">
          {isEditing === "ubicacion" ? (
            <div className="flex-1 flex items-center gap-2">
              <select
                value={editValues.ubicacionId}
                onChange={(e) =>
                  setEditValues({ ...editValues, ubicacionId: e.target.value })
                }
                className="flex-1 px-2 py-1 border rounded text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                autoFocus
              >
                {ubicaciones.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.area} - {u.establecimiento}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleSave("ubicacion")}
                disabled={isLoading}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
              >
                ✓
              </button>
              <button
                onClick={() => setIsEditing(null)}
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span>{ubicacion || "-"}</span>
              {!isCompleted && (
                <button
                  onClick={() => setIsEditing("ubicacion")}
                  className="ml-2 print:hidden"
                >
                  <EditIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Static Fields - Combinados para compactar */}
      {renderDoubleCell("N° Inventario", inventario, "N° Serie", serie)}
      {renderDoubleCell("Marca", marca, "Modelo", modelo)}
      {renderDoubleCell(
        "Período",
        periodicidad || "-",
        "Personal Técnico",
        personalTecnico
      )}

      {/* Equipos de Prueba y Fecha - En la misma fila */}
      <div className="flex border-b border-black dark:border-slate-700">
        {/* Equipos de Prueba */}
        <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
          Equipos de Prueba
        </div>
        <div className="flex-1 p-1.5 flex items-center justify-between text-xs border-r border-black dark:border-slate-700">
          {isEditing === "equiposDePrueba" ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editValues.equiposDePrueba}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    equiposDePrueba: e.target.value,
                  })
                }
                className="flex-1 px-2 py-1 border rounded text-sm"
                autoFocus
              />
              <button
                onClick={() => handleSave("equiposDePrueba")}
                disabled={isLoading}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
              >
                ✓
              </button>
              <button
                onClick={() => setIsEditing(null)}
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span className="dark:text-slate-200">
                {equiposDePrueba || "Tester"}
              </span>
              {!isCompleted && (
                <button
                  onClick={() => setIsEditing("equiposDePrueba")}
                  className="ml-2 print:hidden"
                >
                  <EditIcon />
                </button>
              )}
            </>
          )}
        </div>

        {/* Fecha Mantención */}
        <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
          Fecha Mantención
        </div>
        <div className="flex-1 p-1.5 flex items-center justify-between text-xs">
          {isEditing === "fecha" ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="date"
                value={editValues.fecha}
                onChange={(e) =>
                  setEditValues({ ...editValues, fecha: e.target.value })
                }
                className="flex-1 px-2 py-1 border rounded text-sm"
                autoFocus
              />
              <button
                onClick={() => handleSave("fecha")}
                disabled={isLoading}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
              >
                ✓
              </button>
              <button
                onClick={() => setIsEditing(null)}
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span className="font-semibold text-blue-800 dark:text-blue-400">
                {fechaFormatted}
              </span>
              {!isCompleted && (
                <button
                  onClick={() => setIsEditing("fecha")}
                  className="ml-2 print:hidden"
                >
                  <EditIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Estado y Pauta en una fila */}
      <div className="flex">
        <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
          Estado
        </div>
        <div className="flex-1 p-1.5 border-r border-black dark:border-slate-700">
          <span
            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              estadoMantencion === "COMPLETADA"
                ? "bg-green-100 text-green-800"
                : estadoMantencion === "EN_PROCESO"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
            }`}
          >
            {estadoMantencion}
          </span>
        </div>
        <div className="w-36 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 font-bold p-1.5 border-r border-black dark:border-slate-700 text-xs">
          Pauta Aplicada
        </div>
        <div className="flex-1 p-1.5 text-xs dark:text-slate-200">
          {pautaNombre || "Sin pauta"}
        </div>
      </div>
    </div>
  );
}
