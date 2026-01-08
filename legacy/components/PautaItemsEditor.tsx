"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPautaItem,
  updatePautaItem,
  deletePautaItem,
  movePautaItem,
} from "../actions/pautas";

interface PautaItem {
  id: string;
  order: number;
  description: string;
  isRequired: boolean;
}

interface PautaItemsEditorProps {
  pautaId: string;
  items: PautaItem[];
}

export default function PautaItemsEditor({
  pautaId,
  items: initialItems,
}: PautaItemsEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDescription.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newItem = await createPautaItem({
        pautaId,
        description: newItemDescription.trim(),
        isRequired: newItemRequired,
      });

      setItems([...items, newItem]);
      setNewItemDescription("");
      setNewItemRequired(true);
      router.refresh();
    } catch (err) {
      setError("Error al agregar el item");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (id: string) => {
    if (!editingDescription.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updatePautaItem(id, { description: editingDescription.trim() });
      setItems(
        items.map((item) =>
          item.id === id
            ? { ...item, description: editingDescription.trim() }
            : item
        )
      );
      setEditingId(null);
      setEditingDescription("");
      router.refresh();
    } catch (err) {
      setError("Error al actualizar el item");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRequired = async (id: string, currentRequired: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await updatePautaItem(id, { isRequired: !currentRequired });
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, isRequired: !currentRequired } : item
        )
      );
      router.refresh();
    } catch (err) {
      setError("Error al actualizar el item");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este item?")) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await deletePautaItem(id);
      setItems(items.filter((item) => item.id !== id));
      router.refresh();
    } catch (err) {
      setError("Error al eliminar el item");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveItem = async (id: string, direction: "up" | "down") => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await movePautaItem(id, direction);
      if (result.success) {
        // Reordenar localmente
        const index = items.findIndex((item) => item.id === id);
        const newIndex = direction === "up" ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < items.length) {
          const newItems = [...items];
          const temp = newItems[index].order;
          newItems[index].order = newItems[newIndex].order;
          newItems[newIndex].order = temp;
          newItems.sort((a, b) => a.order - b.order);
          setItems(newItems);
        }
        router.refresh();
      }
    } catch (err) {
      setError("Error al mover el item");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (item: PautaItem) => {
    setEditingId(item.id);
    setEditingDescription(item.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingDescription("");
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Items del Checklist
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {items.length} actividades configuradas
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Lista de items */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {items.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No hay items configurados. Agregue actividades usando el formulario
            de abajo.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
            >
              {/* Número de orden */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="font-bold text-blue-800 dark:text-blue-200">
                  {item.order}
                </span>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="flex-1 px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateItem(item.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 text-zinc-600 dark:text-zinc-400 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <p className="text-zinc-900 dark:text-white">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Badge obligatorio */}
              <button
                onClick={() => handleToggleRequired(item.id, item.isRequired)}
                disabled={isSubmitting}
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  item.isRequired
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {item.isRequired ? "Obligatorio" : "Opcional"}
              </button>

              {/* Acciones */}
              <div className="flex-shrink-0 flex gap-1">
                <button
                  onClick={() => handleMoveItem(item.id, "up")}
                  disabled={isSubmitting || index === 0}
                  className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                  title="Subir"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleMoveItem(item.id, "down")}
                  disabled={isSubmitting || index === items.length - 1}
                  className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                  title="Bajar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => startEditing(item)}
                  disabled={isSubmitting || editingId !== null}
                  className="p-1 text-zinc-400 hover:text-blue-600 disabled:opacity-30"
                  title="Editar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={isSubmitting}
                  className="p-1 text-zinc-400 hover:text-red-600 disabled:opacity-30"
                  title="Eliminar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario para agregar nuevo item */}
      <form
        onSubmit={handleAddItem}
        className="p-6 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
      >
        <div className="flex gap-4">
          <input
            type="text"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            placeholder="Descripción de la nueva actividad..."
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={newItemRequired}
              onChange={(e) => setNewItemRequired(e.target.checked)}
              className="w-4 h-4"
            />
            Obligatorio
          </label>
          <button
            type="submit"
            disabled={isSubmitting || !newItemDescription.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Agregando..." : "Agregar Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
