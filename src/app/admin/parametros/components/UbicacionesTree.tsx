"use client";

import { useState, useEffect } from "react";
import {
  getUbicacionesPorEstablecimiento,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
  renameEstablecimiento,
  updateEstablecimientoInfo,
  deleteEstablecimiento,
} from "@/app/actions/ubicaciones";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  FolderPlus,
  Loader2,
  Camera,
} from "lucide-react";

interface Ubicacion {
  id: string;
  establecimiento: string;
  area: string;
  _count?: { equipos: number };
  descripcion?: string;
  // Area fields
  imagen?: string | null;
  color?: string | null;
  observacion?: string | null;
  // Est. fields
  imagenEstablecimiento?: string | null;
  colorEstablecimiento?: string | null;
  direccion?: string | null;
  observacionEstablecimiento?: string | null;
}

interface TreeItem {
  name: string;
  type: "ESTABLECIMIENTO";
  children: Ubicacion[];
  expanded: boolean;
  metadata?: {
    imagen?: string | null;
    color?: string | null;
    direccion?: string | null;
    observacion?: string | null;
  };
}

interface AreaUploadProps {
  imagen: string | null | undefined;
  onUpload: (url: string) => void;
  loading: boolean;
}

function ImageUploadField({ imagen, onUpload, loading }: AreaUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        Imagen
      </label>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-800">
          {imagen ? (
            <img
              src={imagen}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              onUpload("loading"); // Optional: signal loading start parent
              try {
                const data = new FormData();
                data.append("file", file);
                data.append("tipo", "area"); // or generic

                const res = await fetch("/api/upload", {
                  method: "POST",
                  body: data,
                });

                if (res.ok) {
                  const json = await res.json();
                  onUpload(json.url);
                  toast.success("Imagen subida");
                } else {
                  toast.error("Error al subir imagen");
                }
              } catch (err) {
                toast.error("Error al subir imagen");
              }
            }}
            className="hidden"
            id="image-upload-field"
            disabled={loading}
          />
          <label
            htmlFor="image-upload-field"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors text-sm font-medium ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Seleccionar imagen
              </>
            )}
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Formatos: JPG, PNG, GIF. Máx 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UbicacionesTree() {
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "NEW_EST" | "NEW_AREA" | "EDIT_EST" | "EDIT_AREA"
  >("NEW_EST");
  const [selectedNode, setSelectedNode] = useState<any>(null); // Parent for creates, Item for edits

  // Form data
  const [formData, setFormData] = useState({
    establecimiento: "",
    area: "",
    direccion: "",
    observacion: "",
    imagen: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUbicacionesPorEstablecimiento();
      // Transform record to array
      const items: TreeItem[] = Object.entries(data).map(([name, children]) => {
        // Extract establishment metadata from the first child that has it
        const firstWithMeta = children.find(
          (c) => c.imagenEstablecimiento || c.direccion
        );
        return {
          name,
          type: "ESTABLECIMIENTO",
          children: children as Ubicacion[], // Type assertion needed due to prisma return type wrapper
          expanded: false,
          metadata: {
            imagen: firstWithMeta?.imagenEstablecimiento,
            color: firstWithMeta?.colorEstablecimiento,
            direccion: firstWithMeta?.direccion,
            observacion: firstWithMeta?.observacionEstablecimiento,
          },
        };
      });
      // Sort alphabetically
      items.sort((a, b) => a.name.localeCompare(b.name));
      setTreeData(items);
    } catch (error) {
      toast.error("Error al cargar ubicaciones");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    const newData = [...treeData];
    newData[index].expanded = !newData[index].expanded;
    setTreeData(newData);
  };

  const handleOpenModal = (mode: typeof modalMode, node?: any) => {
    setModalMode(mode);
    setSelectedNode(node);

    // Reset form based on mode
    if (mode === "NEW_EST") {
      setFormData({
        establecimiento: "",
        area: "General",
        direccion: "",
        observacion: "",
        imagen: "",
      });
    } else if (mode === "NEW_AREA") {
      setFormData({
        establecimiento: node.name,
        area: "",
        direccion: "",
        observacion: "",
        imagen: "",
      });
    } else if (mode === "EDIT_EST") {
      setFormData({
        establecimiento: node.name,
        area: "",
        direccion: node.metadata?.direccion || "",
        observacion: node.metadata?.observacion || "",
        imagen: node.metadata?.imagen || "",
      });
    } else if (mode === "EDIT_AREA") {
      setFormData({
        establecimiento: node.establecimiento,
        area: node.area,
        direccion: "",
        observacion: node.observacion || "",
        imagen: node.imagen || "",
      });
    }

    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === "NEW_EST") {
        await createUbicacion({
          establecimiento: formData.establecimiento,
          area: "General", // Default initial area
          direccion: formData.direccion,
          observacionEstablecimiento: formData.observacion,
          imagenEstablecimiento: formData.imagen,
        });
        toast.success("Establecimiento creado");
      } else if (modalMode === "NEW_AREA") {
        await createUbicacion({
          establecimiento: formData.establecimiento,
          area: formData.area,
          observacion: formData.observacion,
          imagen: formData.imagen,
        });
        toast.success("Área creada");
      } else if (modalMode === "EDIT_EST") {
        // Rename if changed
        if (selectedNode.name !== formData.establecimiento) {
          await renameEstablecimiento(
            selectedNode.name,
            formData.establecimiento
          );
        }
        // Update info
        await updateEstablecimientoInfo(formData.establecimiento, {
          direccion: formData.direccion,
          observacionEstablecimiento: formData.observacion,
          imagenEstablecimiento: formData.imagen,
        });
        toast.success("Establecimiento actualizado");
      } else if (modalMode === "EDIT_AREA") {
        await updateUbicacion(selectedNode.id, {
          area: formData.area,
          observacion: formData.observacion,
          imagen: formData.imagen,
        });
        toast.success("Área actualizada");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (node: any, type: "EST" | "AREA") => {
    if (
      !confirm(
        type === "EST"
          ? `¿Eliminar establecimiento ${node.name} y TODAS sus áreas?`
          : `¿Eliminar área ${node.area}?`
      )
    )
      return;

    try {
      if (type === "AREA") {
        await deleteUbicacion(node.id);
        toast.success("Área eliminada");
      } else {
        // For establishment, we need to delete all children
        await deleteEstablecimiento(node.name);
        toast.success("Establecimiento eliminado correctamente");
      }
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar (puede tener equipos asociados)");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Estructura Organizacional
        </h3>
        <button
          onClick={() => handleOpenModal("NEW_EST")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Establecimiento
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {treeData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay ubicaciones registradas.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {treeData.map((est, index) => (
              <div key={est.name} className="group">
                {/* Establishment Row */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => toggleExpand(index)}
                  >
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {est.expanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {est.name}
                      </h4>
                      {est.metadata?.direccion && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {est.metadata.direccion}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                      {est.children.length} áreas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal("NEW_AREA", est)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Agregar Área"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal("EDIT_EST", est)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Placeholder for delete establishment */}
                  </div>
                </div>

                {/* Children Areas */}
                {est.expanded && (
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 pl-14 pr-4 py-2 space-y-1">
                    {est.children.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {area.area}
                          </span>
                          {area._count?.equipos ? (
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                              {area._count.equipos} equipos
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal("EDIT_AREA", area)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(area, "AREA")}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {est.children.length === 0 && (
                      <div className="text-sm text-slate-400 italic py-2">
                        No hay áreas registradas
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalMode === "NEW_EST" && "Nuevo Establecimiento"}
                {modalMode === "NEW_AREA" && "Nueva Área"}
                {modalMode === "EDIT_EST" && "Editar Establecimiento"}
                {modalMode === "EDIT_AREA" && "Editar Área"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {(modalMode === "NEW_EST" || modalMode === "EDIT_EST") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Nombre Establecimiento *
                    </label>
                    <input
                      type="text"
                      value={formData.establecimiento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          establecimiento: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <ImageUploadField
                    imagen={formData.imagen}
                    loading={subiendoImagen}
                    onUpload={(url) => {
                      if (url === "loading") setSubiendoImagen(true);
                      else {
                        setSubiendoImagen(false);
                        setFormData((prev) => ({ ...prev, imagen: url }));
                      }
                    }}
                  />
                </>
              )}

              {(modalMode === "NEW_AREA" || modalMode === "EDIT_AREA") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Nombre Área *
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      autoFocus
                      required
                    />
                  </div>

                  <ImageUploadField
                    imagen={formData.imagen}
                    loading={subiendoImagen}
                    onUpload={(url) => {
                      if (url === "loading") setSubiendoImagen(true);
                      else {
                        setSubiendoImagen(false);
                        setFormData((prev) => ({ ...prev, imagen: url }));
                      }
                    }}
                  />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Observación
                </label>
                <textarea
                  value={formData.observacion}
                  onChange={(e) =>
                    setFormData({ ...formData, observacion: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
