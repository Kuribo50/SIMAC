"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PautaItem {
  id: string;
  description: string;
  order: number;
}

interface Respuesta {
  id: string;
  pautaItemId: string;
  isCompleted: boolean;
  comment: string | null;
}

interface InteractiveChecklistProps {
  mantencionId: string;
  items: PautaItem[];
  respuestas: Respuesta[];
  estadoMantencion: string;
  observaciones: string | null;
  onCompletedCountChange?: (count: number) => void;
  isAdmin?: boolean;
  adminName?: string;
  editedAfterCompletionAt?: Date | null;
  editedAfterCompletionBy?: string | null;
  setObservaciones?: (obs: string) => void;
  // New props for lifted state
  checklistResponses?: Record<string, boolean>;
  onVerifyResponse?: (itemId: string, value: boolean) => void;
}

export default function InteractiveChecklist({
  mantencionId,
  items,
  respuestas,
  estadoMantencion,
  observaciones: initialObservaciones,
  onCompletedCountChange,
  isAdmin = false,
  adminName = "",
  editedAfterCompletionAt,
  editedAfterCompletionBy,
  setObservaciones,
  checklistResponses = {},
  onVerifyResponse,
}: InteractiveChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // No local state for responses anymore, we use checklistResponses prop
  // const [localResponses, setLocalResponses] = ... removed
  // We alias checklistResponses to localResponses to minimize refactor,
  // but better to just use props directly.
  const localResponses = checklistResponses;

  // Saved responses tracking for edit mode needs to be careful.
  // We will assume edit mode works on a snapshot of the props.
  const [savedResponses, setSavedResponses] =
    useState<Record<string, boolean>>(checklistResponses);

  // Use prop for observations, removed local state

  // Modo edición para admin en mantención completada
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Drag-to-select states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectValue, setSelectValue] = useState<boolean | null>(null);
  const [draggedItems, setDraggedItems] = useState<Set<string>>(new Set());

  // La mantención está completada
  const isCompleted = estadoMantencion === "COMPLETADA";

  // Editable normalmente si no está completada
  const isNormalEditable = !isCompleted;

  // Admin puede entrar en modo edición si está completada
  const canAdminEdit = isAdmin && isCompleted;

  // Global mouseup handler for drag-to-select
  useEffect(() => {
    const handleGlobalMouseUp = async () => {
      if (isSelecting && draggedItems.size > 0) {
        setIsSelecting(false);
        setSelectValue(null);
        setDraggedItems(new Set());
        // No auto-save on drag end
      } else if (isSelecting) {
        setIsSelecting(false);
        setSelectValue(null);
        setDraggedItems(new Set());
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isSelecting, draggedItems, localResponses, mantencionId, router]);

  // Calcular y notificar el conteo de completados
  const notifyCompletedCount = (responses: Record<string, boolean>) => {
    const count = Object.values(responses).filter(Boolean).length;
    onCompletedCountChange?.(count);
  };

  // Toggle normal (para mantenciones no completadas)
  const handleToggleItem = async (itemId: string) => {
    if (!isNormalEditable) return;

    const newValue = !localResponses[itemId];
    // Update via prop callback
    onVerifyResponse?.(itemId, newValue);
    // Don't auto save to DB here anymore
  };

  // Toggle en modo edición admin (solo cambia estado local)
  const handleToggleItemEditMode = (itemId: string) => {
    if (!isEditMode) return;
    const newValue = !localResponses[itemId];
    // Update via prop callback to keep UI in sync
    onVerifyResponse?.(itemId, newValue);
  };

  // Drag-to-select handlers
  const handleMouseDown = (itemId: string) => {
    const isEditable = isNormalEditable || isEditMode;
    if (!isEditable) return;

    setIsSelecting(true);
    const newValue = !localResponses[itemId];
    setSelectValue(newValue);

    // Update via prop
    onVerifyResponse?.(itemId, newValue);

    setDraggedItems(new Set([itemId]));
  };

  const handleMouseEnter = (itemId: string) => {
    if (!isSelecting || selectValue === null) return;

    if (localResponses[itemId] !== selectValue) {
      // Update via prop
      onVerifyResponse?.(itemId, selectValue);

      setDraggedItems((prev) => new Set([...Array.from(prev), itemId]));
    }
  };

  // Iniciar modo edición
  const handleStartEdit = () => {
    setSavedResponses({ ...localResponses });
    setIsEditMode(true);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    // Revertir cambios uno por uno ya que el estado se maneja en el padre
    Object.entries(savedResponses).forEach(([itemId, originalValue]) => {
      if (localResponses[itemId] !== originalValue) {
        onVerifyResponse?.(itemId, originalValue);
      }
    });

    notifyCompletedCount(savedResponses);
    setIsEditMode(false);
  };

  // Guardar cambios
  const handleSaveEdit = async () => {
    setIsSaving(true);

    try {
      // Encontrar items que cambiaron
      const changedItems = Object.entries(localResponses).filter(
        ([itemId, value]) => savedResponses[itemId] !== value
      );

      // Guardar cada cambio
      for (const [itemId, isCompleted] of changedItems) {
        const response = await fetch("/api/mantenciones/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mantencionId,
            pautaItemId: itemId,
            isCompleted,
            isAdminEdit: true,
            adminName: adminName,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al guardar cambios");
        }
      }

      setSavedResponses({ ...localResponses });
      setIsEditMode(false);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = Object.values(localResponses).filter(Boolean).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Verificar si hay cambios pendientes
  const hasChanges = Object.entries(localResponses).some(
    ([itemId, value]) => savedResponses[itemId] !== value
  );

  return (
    <>
      {/* Mensaje de edición previa por admin */}
      {editedAfterCompletionBy && editedAfterCompletionAt && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              <strong>Este checklist fue editado por:</strong>{" "}
              {editedAfterCompletionBy}
              <span className="text-blue-600 ml-2">
                (
                {new Date(editedAfterCompletionAt).toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Botón de editar para admin en mantención completada */}
      {canAdminEdit && !isEditMode && (
        <div className="mb-4 print:hidden">
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
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
            Editar Checklist (Administrador)
          </button>
        </div>
      )}

      {/* Barra de modo edición */}
      {isEditMode && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800 rounded-lg print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <svg
                className="w-5 h-5 shrink-0"
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
              <span className="text-sm font-medium">
                Modo Edición Administrador - Haga clic en los ítems para
                modificar
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !hasChanges}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Guardando...
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
          {hasChanges && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              * Hay cambios pendientes por guardar
            </p>
          )}
        </div>
      )}

      {/* Progress Bar (only in edit mode or normal editable) */}
      {(isNormalEditable || isEditMode) && totalCount > 0 && (
        <div className="mb-4 print:hidden">
          <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400 mb-1">
            <span>Progreso del checklist</span>
            <span className="font-semibold">
              {completedCount} de {totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Checklist Table */}
      <div className="border-2 border-black dark:border-slate-700 mb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 dark:text-slate-200">
              <th className="border-r border-b border-black dark:border-slate-700 p-1 w-10 text-center font-bold">
                Item
              </th>
              <th className="border-r border-b border-black dark:border-slate-700 p-1 text-left font-bold">
                Actividad
              </th>
              <th className="border-b border-black dark:border-slate-700 p-1 w-20 text-center font-bold">
                Check List
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => {
                const isChecked = localResponses[item.id] || false;
                const isEditable = isNormalEditable || isEditMode;

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-black dark:border-slate-700 last:border-b-0 transition-colors ${
                      isEditable
                        ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                        : ""
                    } ${
                      isChecked
                        ? "bg-green-50 dark:bg-green-900/10"
                        : "dark:text-slate-200"
                    }`}
                    onClick={() => {
                      if (isNormalEditable) handleToggleItem(item.id);
                      else if (isEditMode) handleToggleItemEditMode(item.id);
                    }}
                  >
                    <td className="border-r border-black dark:border-slate-700 p-1 text-center font-bold">
                      {index + 1}
                    </td>
                    <td className="border-r border-black dark:border-slate-700 p-1">
                      {item.description}
                    </td>
                    <td className="p-1 text-center">
                      {isEditable ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isNormalEditable) handleToggleItem(item.id);
                            else if (isEditMode)
                              handleToggleItemEditMode(item.id);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleMouseDown(item.id);
                          }}
                          onMouseEnter={() => {
                            handleMouseEnter(item.id);
                          }}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                          style={{ userSelect: "none" }}
                        >
                          {isChecked && (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <span
                          className={
                            isChecked
                              ? "text-blue-600 font-bold text-lg"
                              : "text-gray-300"
                          }
                        >
                          {isChecked ? "✓" : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="p-4 text-center text-gray-500 dark:text-slate-400"
                >
                  No hay items de checklist en esta pauta
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Observations */}
      <div className="mb-3">
        <h3 className="font-bold text-xs mb-1 dark:text-slate-200">
          Observaciones:
        </h3>
        {isNormalEditable || isEditMode ? (
          <div className="space-y-2">
            <textarea
              value={initialObservaciones || ""}
              onChange={(e) => setObservaciones?.(e.target.value)}
              className="w-full border border-gray-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg p-2 min-h-[50px] text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 print:hidden"
              placeholder="Escriba sus observaciones aquí..."
            />

            {/* Print version */}
            <div className="hidden print:block border border-gray-400 min-h-10 p-2">
              <p className="text-xs text-gray-700 whitespace-pre-wrap">
                {initialObservaciones || "Sin observaciones"}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-400 dark:border-slate-600 dark:bg-slate-900 min-h-10 p-2">
            <p className="text-xs text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
              {initialObservaciones || "Sin observaciones"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
