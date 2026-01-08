"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getPauta,
  updatePauta,
  deletePauta,
  updatePautaItems,
} from "../../../actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Save,
  Loader2,
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Info,
  Calendar,
} from "lucide-react";

const periodicidades = [
  { value: "MENSUAL", label: "Mensual" },
  { value: "BIMESTRAL", label: "Bimestral" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
  { value: "NO_APLICA", label: "No Aplica" },
];

interface PautaItem {
  id: string;
  description: string;
  isRequired: boolean;
  order?: number;
}

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  periodicidadBase: string;
  tipo?: string | null;
  items?: {
    id: string;
    description: string;
    isRequired: boolean;
    order: number;
  }[];
}

export default function EditPautaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pauta, setPauta] = useState<Pauta | null>(null);

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    periodicidadBase: "ANUAL",
    tipo: "EQUIPAMIENTO",
  });

  // Estado para los items del checklist
  const [items, setItems] = useState<PautaItem[]>([]);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Cargar datos de la pauta
  useEffect(() => {
    const loadPauta = async () => {
      try {
        const data = await getPauta(id);
        if (!data) {
          router.push("/pautas");
          return;
        }
        setPauta(data);
        setFormData({
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          periodicidadBase: data.periodicidadBase,
          tipo: data.tipo || "EQUIPAMIENTO",
        });
        setItems(
          data.items?.map((item) => ({
            id: item.id,
            description: item.description,
            isRequired: item.isRequired,
            order: item.order,
          })) || []
        );
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar la pauta");
      } finally {
        setLoading(false);
      }
    };
    loadPauta();
  }, [id, router]);

  // Agregar nuevo item
  const addItem = () => {
    if (!newItemDescription.trim()) {
      toast.error("Ingrese una descripción para el item");
      return;
    }

    const newItem: PautaItem = {
      id: `temp-${Date.now()}`,
      description: newItemDescription.trim(),
      isRequired: newItemRequired,
    };

    setItems([...items, newItem]);
    setNewItemDescription("");
    setNewItemRequired(true);
  };

  // Eliminar item
  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Iniciar edición de item
  const startEditing = (item: PautaItem) => {
    setEditingItemId(item.id);
    setEditingText(item.description);
  };

  // Guardar edición
  const saveEdit = (itemId: string) => {
    if (!editingText.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, description: editingText.trim() } : item
      )
    );
    setEditingItemId(null);
    setEditingText("");
  };

  // Toggle obligatorio
  const toggleRequired = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, isRequired: !item.isRequired } : item
      )
    );
  };

  // Mover item arriba
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    setItems(newItems);
  };

  // Mover item abajo
  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.nombre) {
      toast.error("Por favor complete los campos requeridos");
      return;
    }

    if (items.length === 0) {
      toast.error("Agregue al menos un item al checklist");
      return;
    }

    try {
      setSubmitting(true);

      // Actualizar datos de la pauta
      await updatePauta(id, {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        periodicidadBase: formData.periodicidadBase as any,
        tipo: formData.tipo as any,
      });

      // Actualizar items del checklist
      await updatePautaItems(
        id,
        items.map((item, index) => ({
          id: item.id.startsWith("temp-") ? undefined : item.id,
          description: item.description,
          isRequired: item.isRequired,
          order: index + 1,
        }))
      );

      toast.success("Pauta actualizada correctamente");
      router.push(`/pautas/${id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la pauta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (forceDelete: boolean = false) => {
    setDeleting(true);
    try {
      const result = await deletePauta(id, forceDelete);

      if (result.cannotDelete) {
        toast.info(
          result.message ||
            `La pauta "${result.pautaNombre}" está en desuso y ha sido marcada como INACTIVA.`,
          { duration: 6000 }
        );
        setShowDeleteConfirm(false);
        router.push(`/pautas/${id}`);
        router.refresh();
        return;
      }

      if (result.requiresConfirmation) {
        const confirmed = window.confirm(
          `Esta pauta tiene ${result.mantencionesCount || 0} mantención(es) y ${
            result.equiposCount || 0
          } equipo(s) asignado(s). ` +
            `Si continúa, las mantenciones y equipos quedarán sin pauta asignada. ¿Desea continuar?`
        );

        if (confirmed) {
          await handleDelete(true);
        } else {
          setDeleting(false);
          setShowDeleteConfirm(false);
        }
        return;
      }

      toast.success("Pauta eliminada exitosamente");
      router.push("/pautas");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la pauta");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Cargando pauta...</p>
        </div>
      </div>
    );
  }

  if (!pauta) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header with Actions */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10 transition-all duration-200 shadow-sm">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/pautas/${id}`}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Editar Pauta
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {pauta.codigo} - {pauta.nombre}
              </p>
            </div>
          </div>

          {/* Actions in Header */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors font-medium text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Eliminar</span>
            </button>
            <Link
              href={`/pautas/${id}`}
              className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors font-medium text-sm"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              form="edit-pauta-form"
              disabled={submitting || items.length === 0}
              className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-full hover:bg-slate-800 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md text-sm font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-6 py-8 pb-32">
        <form
          id="edit-pauta-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
          {/* Left Column: Basic Info (4/12) */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Información Básica
              </h2>

              <div className="space-y-6">
                {/* Código */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Ej: PM-001"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                  <p className="mt-1.5 text-[10px] text-slate-400 font-medium ml-1">
                    Identificador único, ej. PM-DEA-01
                  </p>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Ej: Mantención Preventiva DEA"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    rows={3}
                    placeholder="Detalles sobre el ámbito de aplicación de esta pauta..."
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                {/* Periodicidad */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Periodicidad Base
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {periodicidades.map((p) => (
                      <label
                        key={p.value}
                        className={`relative flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.periodicidadBase === p.value
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm dark:border-blue-500/50"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="periodicidad"
                          value={p.value}
                          checked={formData.periodicidadBase === p.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              periodicidadBase: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <span className="text-xs font-bold">{p.label}</span>
                        {formData.periodicidadBase === p.value && (
                          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipo de Pauta */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 ml-1 flex items-center gap-2">
                    <ListTodo className="w-3 h-3" />
                    Categoría
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        value: "RECURSO_HUMANO",
                        label: "Recurso Humano",
                        icon: "📋",
                      },
                      {
                        value: "INFRAESTRUCTURA",
                        label: "Infraestructura",
                        icon: "🏢",
                      },
                      {
                        value: "EQUIPAMIENTO",
                        label: "Equipamiento",
                        icon: "🔧",
                      },
                    ].map((t) => (
                      <label
                        key={t.value}
                        className={`relative flex items-center justify-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.tipo === t.value
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm dark:border-emerald-500/50"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipo"
                          value={t.value}
                          checked={formData.tipo === t.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tipo: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-sm font-bold">{t.label}</span>
                        {formData.tipo === t.value && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checklist Items (8/12) */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-emerald-500" />
                  Checklist de Actividades
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                    {items.length}
                  </span>
                </h2>
              </div>

              {/* Add New Item Form */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6 group focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-700 focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-400 transition-colors">
                      Nueva Actividad
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItem();
                          }
                        }}
                        placeholder="Escriba la descripción de la actividad..."
                        className="w-full pl-4 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                        <Edit2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <button
                      type="button"
                      onClick={() => setNewItemRequired(!newItemRequired)}
                      className={`h-[46px] px-4 rounded-xl flex items-center gap-2 border transition-all ${
                        newItemRequired
                          ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                      title={newItemRequired ? "Es obligatorio" : "Es opcional"}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          newItemRequired ? "fill-current" : "stroke-current"
                        }`}
                      />
                      <span className="text-xs font-bold hidden md:inline">
                        {newItemRequired ? "Req." : "Opc."}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={addItem}
                      disabled={!newItemDescription.trim()}
                      className="h-[46px] px-6 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    <ListTodo className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold mb-1">
                    El checklist está vacío
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Agregue las actividades que los técnicos deberán verificar
                    durante la mantención.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                        item.isRequired
                          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          : "bg-slate-50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800"
                      }`}
                    >
                      {/* Drag Handle & Index */}
                      <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveEdit(item.id);
                                }
                                if (e.key === "Escape") {
                                  setEditingItemId(null);
                                  setEditingText("");
                                }
                              }}
                              autoFocus
                              className="w-full px-3 py-1.5 border border-blue-500 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <p
                            className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 truncate"
                            onClick={() => startEditing(item)}
                            title="Click para editar"
                          >
                            {item.description}
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500" />
                          </p>
                        )}
                        {item.isRequired && (
                          <span className="text-[10px] uppercase font-bold text-red-500 dark:text-red-400 tracking-wider flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Obligatorio
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => toggleRequired(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isRequired
                              ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title={
                            item.isRequired
                              ? "Hacer opcional"
                              : "Hacer obligatorio"
                          }
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          >
                            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-[6px] border-b-current"></div>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(index)}
                            disabled={index === items.length - 1}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          >
                            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-current"></div>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usage Tip */}
            {items.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
                <Info className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Sugerencia:</strong> Puede reordenar los items usando
                  las flechas pequeñas a la derecha. Marque como{" "}
                  <em>Obligatorio</em> aquellos puntos críticos que impidan
                  finalizar la mantención si no se cumplen.
                </p>
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 shadow-xl w-full max-w-md rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Eliminar Pauta
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                ¿Está seguro que desea eliminar la pauta{" "}
                <strong>{pauta.nombre}</strong>? Si tiene mantenciones
                asociadas, no podrá ser eliminada.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(false)}
                  disabled={deleting}
                  className="px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 rounded-xl font-bold"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
