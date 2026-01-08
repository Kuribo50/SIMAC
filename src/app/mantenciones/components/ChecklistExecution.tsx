"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateChecklistResponse,
  updateMultipleChecklistResponses,
} from "@/app/actions/mantenciones";

interface PautaItem {
  id: string;
  order: number;
  description: string;
  isRequired: boolean;
}

interface ChecklistResponse {
  id: string;
  pautaItemId: string;
  isCompleted: boolean;
  comment?: string | null;
  pautaItem: PautaItem;
}

interface ChecklistExecutionProps {
  mantencionId: string;
  pautaItems: PautaItem[];
  responses: ChecklistResponse[];
  onProgressUpdate?: (completed: number, total: number) => void;
}

export default function ChecklistExecution({
  mantencionId,
  pautaItems,
  responses,
  onProgressUpdate,
}: ChecklistExecutionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localResponses, setLocalResponses] = useState<
    Map<string, { isCompleted: boolean; comment: string }>
  >(() => {
    const map = new Map();
    // Inicializar con las respuestas existentes
    responses.forEach((r) => {
      map.set(r.pautaItemId, {
        isCompleted: r.isCompleted,
        comment: r.comment || "",
      });
    });
    // Agregar items que no tienen respuesta aún
    pautaItems.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, { isCompleted: false, comment: "" });
      }
    });
    return map;
  });
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  // Calcular progreso
  const completedCount = Array.from(localResponses.values()).filter(
    (r) => r.isCompleted
  ).length;
  const totalCount = pautaItems.length;
  const requiredItems = pautaItems.filter((item) => item.isRequired);
  const completedRequired = requiredItems.filter(
    (item) => localResponses.get(item.id)?.isCompleted
  ).length;

  // Notificar progreso
  if (onProgressUpdate) {
    onProgressUpdate(completedCount, totalCount);
  }

  const handleCheckChange = async (itemId: string, isCompleted: boolean) => {
    // Actualizar estado local inmediatamente
    setLocalResponses((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(itemId) || { isCompleted: false, comment: "" };
      newMap.set(itemId, { ...current, isCompleted });
      return newMap;
    });

    // Marcar como guardando
    setSavingItems((prev) => new Set(prev).add(itemId));
    setSavedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });

    // Guardar en servidor
    startTransition(async () => {
      try {
        await updateChecklistResponse(mantencionId, itemId, { isCompleted });
        setSavedItems((prev) => new Set(prev).add(itemId));
        setTimeout(() => {
          setSavedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        }, 2000);
      } catch (error) {
        console.error("Error updating checklist response:", error);
        // Revertir en caso de error
        setLocalResponses((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(itemId) || {
            isCompleted: false,
            comment: "",
          };
          newMap.set(itemId, { ...current, isCompleted: !isCompleted });
          return newMap;
        });
      } finally {
        setSavingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    });
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setLocalResponses((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(itemId) || { isCompleted: false, comment: "" };
      newMap.set(itemId, { ...current, comment });
      return newMap;
    });
  };

  const handleCommentBlur = async (itemId: string) => {
    const comment = localResponses.get(itemId)?.comment || "";

    setSavingItems((prev) => new Set(prev).add(itemId));

    startTransition(async () => {
      try {
        await updateChecklistResponse(mantencionId, itemId, { comment });
        setSavedItems((prev) => new Set(prev).add(itemId));
        setTimeout(() => {
          setSavedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        }, 2000);
      } catch (error) {
        console.error("Error updating comment:", error);
      } finally {
        setSavingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    });
  };

  const toggleComment = (itemId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleCheckAll = async () => {
    // Marcar todos como completados localmente
    const newResponses = new Map(localResponses);
    pautaItems.forEach((item) => {
      const current = newResponses.get(item.id) || {
        isCompleted: false,
        comment: "",
      };
      newResponses.set(item.id, { ...current, isCompleted: true });
    });
    setLocalResponses(newResponses);

    // Guardar en servidor
    startTransition(async () => {
      try {
        const updates = pautaItems.map((item) => ({
          pautaItemId: item.id,
          isCompleted: true,
          comment: localResponses.get(item.id)?.comment,
        }));
        await updateMultipleChecklistResponses(mantencionId, updates);
        router.refresh();
      } catch (error) {
        console.error("Error updating all responses:", error);
      }
    });
  };

  const handleUncheckAll = async () => {
    // Desmarcar todos localmente
    const newResponses = new Map(localResponses);
    pautaItems.forEach((item) => {
      const current = newResponses.get(item.id) || {
        isCompleted: false,
        comment: "",
      };
      newResponses.set(item.id, { ...current, isCompleted: false });
    });
    setLocalResponses(newResponses);

    // Guardar en servidor
    startTransition(async () => {
      try {
        const updates = pautaItems.map((item) => ({
          pautaItemId: item.id,
          isCompleted: false,
          comment: localResponses.get(item.id)?.comment,
        }));
        await updateMultipleChecklistResponses(mantencionId, updates);
        router.refresh();
      } catch (error) {
        console.error("Error updating all responses:", error);
      }
    });
  };

  // Ordenar items por orden
  const sortedItems = [...pautaItems].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Header con progreso */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Checklist de Mantención
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {completedCount} de {totalCount} ítems completados
            {requiredItems.length > 0 && (
              <span className="ml-2">
                • {completedRequired}/{requiredItems.length} obligatorios
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckAll}
            disabled={isPending || completedCount === totalCount}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Marcar todos
          </button>
          <button
            onClick={handleUncheckAll}
            disabled={isPending || completedCount === 0}
            className="px-3 py-1.5 text-sm bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Desmarcar todos
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        <p className="text-right text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {Math.round((completedCount / totalCount) * 100)}% completado
        </p>
      </div>

      {/* Lista de ítems */}
      <div className="space-y-2">
        {sortedItems.map((item, index) => {
          const response = localResponses.get(item.id) || {
            isCompleted: false,
            comment: "",
          };
          const isExpanded = expandedComments.has(item.id);
          const isSaving = savingItems.has(item.id);
          const isSaved = savedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-lg border transition-all ${
                response.isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="shrink-0 pt-0.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={response.isCompleted}
                        onChange={(e) =>
                          handleCheckChange(item.id, e.target.checked)
                        }
                        disabled={isSaving}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          response.isCompleted
                            ? "bg-green-600 border-green-600"
                            : "bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 peer-hover:border-green-500"
                        }`}
                      >
                        {response.isCompleted && (
                          <svg
                            className="w-4 h-4 text-white"
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
                      </div>
                    </label>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mr-2">
                          #{index + 1}
                        </span>
                        <span
                          className={`text-sm ${
                            response.isCompleted
                              ? "text-green-800 dark:text-green-200 line-through opacity-75"
                              : "text-zinc-900 dark:text-white"
                          }`}
                        >
                          {item.description}
                        </span>
                        {item.isRequired && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                            Obligatorio
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isSaving && (
                          <svg
                            className="w-4 h-4 text-blue-500 animate-spin"
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
                        )}
                        {isSaved && (
                          <svg
                            className="w-4 h-4 text-green-500"
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
                        )}
                        <button
                          onClick={() => toggleComment(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isExpanded || response.comment
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
                          }`}
                          title="Agregar comentario"
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
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Campo de comentario expandible */}
                    {isExpanded && (
                      <div className="mt-3">
                        <textarea
                          value={response.comment}
                          onChange={(e) =>
                            handleCommentChange(item.id, e.target.value)
                          }
                          onBlur={() => handleCommentBlur(item.id)}
                          placeholder="Agregar observación o comentario..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    )}

                    {/* Mostrar comentario si existe y no está expandido */}
                    {!isExpanded && response.comment && (
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
                        💬 {response.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si todos los requeridos están completados */}
      {completedRequired === requiredItems.length &&
        requiredItems.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
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
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  ¡Ítems obligatorios completados!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Puede proceder a firmar la mantención.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
