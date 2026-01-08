"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getUbicaciones,
  createUbicacion,
  updateEstablecimientoInfo,
  renameEstablecimiento,
} from "../actions/ubicaciones";
import { Button } from "../components/ui/Button";
import {
  Building2,
  Plus,
  X,
  Search,
  Pencil,
  MapPin,
  Camera,
  ChevronRight,
  Package,
  Layers,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// Colores predefinidos
const COLORES = [
  { nombre: "Azul", valor: "#3B82F6" },
  { nombre: "Verde", valor: "#10B981" },
  { nombre: "Rojo", valor: "#EF4444" },
  { nombre: "Amarillo", valor: "#F59E0B" },
  { nombre: "Púrpura", valor: "#8B5CF6" },
  { nombre: "Rosa", valor: "#EC4899" },
  { nombre: "Naranja", valor: "#F97316" },
  { nombre: "Cian", valor: "#06B6D4" },
];

interface EstablecimientoData {
  nombre: string;
  imagen?: string | null;
  direccion?: string | null;
  color?: string | null;
  observacion?: string | null;
  areasCount: number;
  equiposCount: number;
}

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal crear/editar establecimiento
  const [showModal, setShowModal] = useState(false);
  const [editingEstablecimiento, setEditingEstablecimiento] = useState<
    string | null
  >(null);
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState("");
  const [direccionEstablecimiento, setDireccionEstablecimiento] = useState("");
  const [imagenEstablecimiento, setImagenEstablecimiento] = useState("");
  const [colorEstablecimiento, setColorEstablecimiento] = useState("#3B82F6");
  const [observacionEstablecimiento, setObservacionEstablecimiento] =
    useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getUbicaciones();
    setUbicaciones(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Agrupar por establecimiento
  const establecimientos = useMemo(() => {
    const establecimientosMap: Record<string, EstablecimientoData> = {};

    ubicaciones.forEach((u) => {
      if (!establecimientosMap[u.establecimiento]) {
        establecimientosMap[u.establecimiento] = {
          nombre: u.establecimiento,
          imagen: u.imagenEstablecimiento || null,
          direccion: u.direccion || null,
          color: u.colorEstablecimiento || null,
          observacion: u.observacionEstablecimiento || null,
          areasCount: 1,
          equiposCount: u._count?.equipos || 0,
        };
      } else {
        const existing = establecimientosMap[u.establecimiento];
        existing.areasCount += 1;
        existing.equiposCount += u._count?.equipos || 0;
        if (!existing.imagen && u.imagenEstablecimiento) {
          existing.imagen = u.imagenEstablecimiento;
        }
        if (!existing.color && u.colorEstablecimiento) {
          existing.color = u.colorEstablecimiento;
        }
        if (!existing.direccion && u.direccion) {
          existing.direccion = u.direccion;
        }
      }
    });

    return Object.values(establecimientosMap).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [ubicaciones]);

  // Stats totales
  const stats = useMemo(() => {
    const totalAreas = ubicaciones.length;
    const totalEquipos = ubicaciones.reduce(
      (sum, u) => sum + (u._count?.equipos || 0),
      0
    );
    return {
      establecimientos: establecimientos.length,
      areas: totalAreas,
      equipos: totalEquipos,
    };
  }, [establecimientos, ubicaciones]);

  // Filtrar
  const establecimientosFiltrados = establecimientos.filter(
    (est) =>
      est.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.direccion?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Subir imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", "establecimiento");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImagenEstablecimiento(data.url);
        toast.success("Imagen subida correctamente");
      } else {
        toast.error("Error al subir imagen");
      }
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setSubiendoImagen(false);
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingEstablecimiento(null);
    setNombreEstablecimiento("");
    setDireccionEstablecimiento("");
    setImagenEstablecimiento("");
    setColorEstablecimiento("#3B82F6");
    setObservacionEstablecimiento("");
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (est: EstablecimientoData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEstablecimiento(est.nombre);
    setNombreEstablecimiento(est.nombre);
    setDireccionEstablecimiento(est.direccion || "");
    setImagenEstablecimiento(est.imagen || "");
    setColorEstablecimiento(est.color || "#3B82F6");
    setObservacionEstablecimiento(est.observacion || "");
    setShowModal(true);
  };

  // Guardar establecimiento
  const handleSave = async () => {
    if (!nombreEstablecimiento.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setGuardando(true);
    try {
      if (editingEstablecimiento) {
        if (nombreEstablecimiento.trim() !== editingEstablecimiento) {
          await renameEstablecimiento(
            editingEstablecimiento,
            nombreEstablecimiento.trim()
          );
        }
        await updateEstablecimientoInfo(nombreEstablecimiento.trim(), {
          direccion: direccionEstablecimiento.trim() || undefined,
          imagenEstablecimiento: imagenEstablecimiento || undefined,
          colorEstablecimiento: colorEstablecimiento || undefined,
          observacionEstablecimiento:
            observacionEstablecimiento.trim() || undefined,
        });
        toast.success("Establecimiento actualizado");
      } else {
        await createUbicacion({
          establecimiento: nombreEstablecimiento.trim(),
          area: "General",
          color: "#10b981",
          imagenEstablecimiento: imagenEstablecimiento || undefined,
          colorEstablecimiento: colorEstablecimiento || undefined,
          direccion: direccionEstablecimiento.trim() || undefined,
          observacionEstablecimiento:
            observacionEstablecimiento.trim() || undefined,
        });
        toast.success("Establecimiento creado");
      }
      setShowModal(false);
      fetchData();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            Cargando establecimientos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Gestión de Ubicaciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Administra los establecimientos y sus áreas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.establecimientos}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Establecimientos
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.areas}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Áreas
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.equipos}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Equipos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Establecimientos - Estilo Tabla */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Listado de Establecimientos
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {establecimientosFiltrados.length}
              </span>
            </h2>

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar establecimientos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </button>
            </div>
          </div>

          {/* Tabla/Lista */}
          {establecimientosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchQuery
                  ? "No se encontraron establecimientos"
                  : "No hay establecimientos registrados"}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Limpiar búsqueda
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Crear primer establecimiento
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {establecimientosFiltrados.map((est) => (
                <div
                  key={est.nombre}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Imagen/Color */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                    {est.imagen ? (
                      <img
                        src={est.imagen}
                        alt={est.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: est.color || "#3B82F6" }}
                      >
                        <Building2 className="w-7 h-7 text-white/80" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {est.nombre}
                    </h3>
                    {est.direccion && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {est.direccion}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {est.areasCount}{" "}
                        {est.areasCount === 1 ? "área" : "áreas"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {est.equiposCount}{" "}
                        {est.equiposCount === 1 ? "equipo" : "equipos"}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEdit(est, e)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/ubicaciones/${encodeURIComponent(est.nombre)}`}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                    >
                      <span>Administrar</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingEstablecimiento
                    ? "Editar Establecimiento"
                    : "Nuevo Establecimiento"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {editingEstablecimiento
                    ? "Modifica la información del centro"
                    : "Agrega un nuevo centro de salud"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-5">
              {/* Imagen Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Foto del Establecimiento
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800">
                    {imagenEstablecimiento ? (
                      <img
                        src={imagenEstablecimiento}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colorEstablecimiento + "20" }}
                      >
                        <Building2
                          className="w-10 h-10"
                          style={{ color: colorEstablecimiento }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="establecimiento-image"
                      disabled={subiendoImagen}
                    />
                    <label
                      htmlFor="establecimiento-image"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors text-sm font-medium ${
                        subiendoImagen ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {subiendoImagen ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Seleccionar imagen
                        </>
                      )}
                    </label>
                    <p className="text-xs text-slate-500">
                      JPG, PNG. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre del Establecimiento *
                </label>
                <input
                  type="text"
                  value={nombreEstablecimiento}
                  onChange={(e) => setNombreEstablecimiento(e.target.value)}
                  placeholder="Ej: CESFAM San José"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={direccionEstablecimiento}
                    onChange={(e) =>
                      setDireccionEstablecimiento(e.target.value)
                    }
                    placeholder="Ej: Av. Principal 123, Comuna"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color (si no hay imagen)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORES.map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => setColorEstablecimiento(color.valor)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        colorEstablecimiento === color.valor
                          ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.valor }}
                      title={color.nombre}
                    />
                  ))}
                </div>
              </div>

              {/* Observación */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Observaciones
                </label>
                <textarea
                  value={observacionEstablecimiento}
                  onChange={(e) =>
                    setObservacionEstablecimiento(e.target.value)
                  }
                  placeholder="Notas adicionales..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowModal(false)}
                disabled={guardando}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={guardando || !nombreEstablecimiento.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70"
              >
                {guardando && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {editingEstablecimiento
                  ? "Guardar cambios"
                  : "Crear establecimiento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
