"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getUbicaciones,
  createUbicacion,
  getEstablecimientos,
  updateUbicacion,
  deleteUbicacion,
} from "../../actions/ubicaciones";
import { Button } from "../../components/ui/Button";
import {
  ChevronRight,
  MapPin,
  Building2,
  Package,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Camera,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

export default function EstablecimientoAreasPage() {
  const params = useParams();
  const router = useRouter();
  const establecimiento = decodeURIComponent(params.establecimiento as string);

  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [establecimientos, setEstablecimientos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal crear área
  const [showModal, setShowModal] = useState(false);
  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevaAreaImagen, setNuevaAreaImagen] = useState("");
  const [nuevaAreaObservacion, setNuevaAreaObservacion] = useState("");
  const [nuevaAreaColor, setNuevaAreaColor] = useState("#10b981");
  const [creando, setCreando] = useState(false);

  // Modal editar área
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<any>(null);
  const [editArea, setEditArea] = useState("");
  const [editEstablecimiento, setEditEstablecimiento] = useState("");
  const [editAreaImagen, setEditAreaImagen] = useState("");
  const [editAreaObservacion, setEditAreaObservacion] = useState("");
  const [editAreaColor, setEditAreaColor] = useState("#10b981");
  const [guardando, setGuardando] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [data, estabs] = await Promise.all([
      getUbicaciones(),
      getEstablecimientos(),
    ]);
    setUbicaciones(data);
    setEstablecimientos(estabs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Info del establecimiento
  const estabInfo = useMemo(() => {
    const areasDelEstab = ubicaciones.filter(
      (u) => u.establecimiento === establecimiento
    );
    const first = areasDelEstab[0] || {};
    return {
      ...first,
      imagen: first.imagenEstablecimiento,
      color: first.colorEstablecimiento,
      observacion: first.observacionEstablecimiento,
      direccion: first.direccion,
    };
  }, [ubicaciones, establecimiento]);

  const estabColor =
    estabInfo.colorEstablecimiento || estabInfo.color || "#3b82f6";

  // Áreas del establecimiento filtradas
  const areasDelEstablecimiento = useMemo(() => {
    let areas = ubicaciones
      .filter((u) => u.establecimiento === establecimiento)
      .sort((a, b) => a.area.localeCompare(b.area));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      areas = areas.filter((u) => u.area.toLowerCase().includes(query));
    }

    return areas;
  }, [ubicaciones, establecimiento, searchQuery]);

  const totalEquipos = areasDelEstablecimiento.reduce(
    (sum, u) => sum + (u._count?.equipos || 0),
    0
  );

  const handleCrearArea = async () => {
    if (!nuevaArea.trim()) {
      toast.error("El nombre del área es requerido");
      return;
    }

    setCreando(true);
    try {
      await createUbicacion({
        establecimiento,
        area: nuevaArea.trim(),
        imagen: nuevaAreaImagen || undefined,
        observacion: nuevaAreaObservacion.trim() || undefined,
        color: nuevaAreaColor || undefined,
      });
      toast.success("Área creada correctamente");
      setShowModal(false);
      setNuevaArea("");
      setNuevaAreaImagen("");
      setNuevaAreaObservacion("");
      setNuevaAreaColor("#10b981");
      fetchData();
    } catch (error) {
      toast.error("Error al crear el área");
    } finally {
      setCreando(false);
    }
  };

  const handleEditarUbicacion = async () => {
    if (!editingUbicacion || !editArea.trim()) {
      toast.error("El nombre del área es requerido");
      return;
    }

    setGuardando(true);
    try {
      await updateUbicacion(editingUbicacion.id, {
        area: editArea.trim(),
        establecimiento: editEstablecimiento,
        imagen: editAreaImagen || undefined,
        observacion: editAreaObservacion.trim() || undefined,
        color: editAreaColor || undefined,
      });
      toast.success("Área actualizada correctamente");
      setShowEditModal(false);
      setEditingUbicacion(null);
      fetchData();

      if (editEstablecimiento !== establecimiento) {
        router.push(`/ubicaciones/${encodeURIComponent(editEstablecimiento)}`);
      }
    } catch (error) {
      toast.error("Error al actualizar el área");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarUbicacion = async (ubicacion: any) => {
    if (ubicacion._count?.equipos > 0) {
      toast.error("No se puede eliminar una ubicación con equipos asociados");
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el área "${ubicacion.area}"?`)) {
      return;
    }

    try {
      await deleteUbicacion(ubicacion.id);
      toast.success("Ubicación eliminada correctamente");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la ubicación");
    }
  };

  const openEditModal = (ubicacion: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUbicacion(ubicacion);
    setEditArea(ubicacion.area);
    setEditEstablecimiento(ubicacion.establecimiento);
    setEditAreaImagen(ubicacion.imagen || "");
    setEditAreaObservacion(ubicacion.observacion || "");
    setEditAreaColor(ubicacion.color || "#10b981");
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            Cargando áreas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/ubicaciones"
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-4 flex-1">
            {estabInfo.imagen ? (
              <img
                src={estabInfo.imagen}
                alt={establecimiento}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: estabColor + "20" }}
              >
                <Building2 className="w-7 h-7" style={{ color: estabColor }} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {establecimiento}
              </h1>
              {estabInfo.direccion && (
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {estabInfo.direccion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {areasDelEstablecimiento.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Áreas
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {totalEquipos}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Equipos
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {
                    areasDelEstablecimiento.filter(
                      (a) => (a._count?.equipos || 0) > 0
                    ).length
                  }
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Con Equipos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de áreas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Áreas
              </h2>
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                {areasDelEstablecimiento.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar área..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Nueva Área
              </Button>
            </div>
          </div>

          {/* Lista */}
          {areasDelEstablecimiento.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Sin áreas
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery
                  ? "No se encontraron áreas con ese nombre"
                  : "Este establecimiento no tiene áreas definidas"}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Crear Área
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {areasDelEstablecimiento.map((ubicacion: any) => (
                <div
                  key={ubicacion.id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Imagen */}
                  <Link
                    href={`/ubicaciones/${encodeURIComponent(
                      establecimiento
                    )}/${ubicacion.id}`}
                    className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800"
                  >
                    {ubicacion.imagen ? (
                      <img
                        src={ubicacion.imagen}
                        alt={ubicacion.area}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            (ubicacion.color || "#10b981") + "15",
                        }}
                      >
                        <MapPin
                          className="w-5 h-5"
                          style={{ color: ubicacion.color || "#10b981" }}
                        />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/ubicaciones/${encodeURIComponent(
                        establecimiento
                      )}/${ubicacion.id}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {ubicacion.area}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {ubicacion._count?.equipos || 0} equipos
                      </span>
                      {ubicacion.observacion && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">
                            •
                          </span>
                          <span className="text-sm text-slate-400 dark:text-slate-500 truncate max-w-xs">
                            {ubicacion.observacion}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Color indicator */}
                  {ubicacion.color && (
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: ubicacion.color }}
                    />
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(ubicacion, e)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarUbicacion(ubicacion);
                      }}
                      disabled={ubicacion._count?.equipos > 0}
                      className={`p-2 rounded-lg transition-colors ${
                        ubicacion._count?.equipos > 0
                          ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                          : "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                      }`}
                      title={
                        ubicacion._count?.equipos > 0
                          ? "Tiene equipos asociados"
                          : "Eliminar"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Link arrow */}
                  <Link
                    href={`/ubicaciones/${encodeURIComponent(
                      establecimiento
                    )}/${ubicacion.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Área */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Nueva Área
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Imagen del Área
                </label>
                {nuevaAreaImagen ? (
                  <div className="relative group">
                    <img
                      src={nuevaAreaImagen}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      onClick={() => setNuevaAreaImagen("")}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("La imagen no debe superar los 2MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNuevaAreaImagen(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre del Área *
                </label>
                <input
                  type="text"
                  value={nuevaArea}
                  onChange={(e) => setNuevaArea(e.target.value)}
                  placeholder="Ej: Sala de calderas, Piso 2..."
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Observación */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Observación
                </label>
                <textarea
                  value={nuevaAreaObservacion}
                  onChange={(e) => setNuevaAreaObservacion(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color identificador
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={nuevaAreaColor}
                    onChange={(e) => setNuevaAreaColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#10b981",
                      "#3b82f6",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#ec4899",
                      "#06b6d4",
                      "#84cc16",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setNuevaAreaColor(color)}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          nuevaAreaColor === color
                            ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCrearArea}
                disabled={creando}
              >
                {creando ? "Creando..." : "Crear Área"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Área */}
      {showEditModal && editingUbicacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: editAreaColor + "20" }}
                >
                  <Pencil
                    className="w-4 h-4"
                    style={{ color: editAreaColor }}
                  />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Editar Área
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUbicacion(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Imagen del Área
                </label>
                {editAreaImagen ? (
                  <div className="relative group">
                    <img
                      src={editAreaImagen}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      onClick={() => setEditAreaImagen("")}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("La imagen no debe superar los 2MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setEditAreaImagen(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Establecimiento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Establecimiento
                </label>
                <select
                  value={editEstablecimiento}
                  onChange={(e) => setEditEstablecimiento(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {establecimientos.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre del Área
                </label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Observación */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Observación
                </label>
                <textarea
                  value={editAreaObservacion}
                  onChange={(e) => setEditAreaObservacion(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color identificador
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editAreaColor}
                    onChange={(e) => setEditAreaColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#10b981",
                      "#3b82f6",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#ec4899",
                      "#06b6d4",
                      "#84cc16",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditAreaColor(color)}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          editAreaColor === color
                            ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUbicacion(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleEditarUbicacion}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
