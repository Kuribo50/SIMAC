"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createEquipo } from "../../actions";
import { getUbicaciones, getTiposEquipo, getPautas } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Upload,
  Trash2,
  Info,
  FileText,
  Settings,
  AlertTriangle,
  Save,
  Loader2,
  Image as ImageIcon,
  Search,
  Check,
  ChevronDown,
  X,
} from "lucide-react";

interface Ubicacion {
  id: string;
  establecimiento: string;
  area: string;
}

interface TipoEquipo {
  id: string;
  codigo: string;
  categoria: string;
  subcategoria: string;
}

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  periodicidadBase: string;
}

// --- Reusable Combobox Component (Input with Dropdown) ---
interface Option {
  id: string;
  label: string;
  sublabel?: string;
  group?: string;
}

interface ComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
}

function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search with value label when value changes externally or on mount
  useEffect(() => {
    const selected = options.find((opt) => opt.id === value);
    if (selected) {
      setSearch(selected.label);
    } else {
      setSearch("");
    }
  }, [value, options]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset search to selected value if closed without selecting new
        const selected = options.find((opt) => opt.id === value);
        if (selected) {
          setSearch(selected.label);
        } else if (!value) {
          setSearch("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!search && !isOpen) return options;

    const selected = options.find((opt) => opt.id === value);
    if (selected && search === selected.label) {
      return options;
    }

    const lowerSearch = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerSearch) ||
        opt.sublabel?.toLowerCase().includes(lowerSearch) ||
        opt.group?.toLowerCase().includes(lowerSearch)
    );
  }, [options, search, value, isOpen]);

  // Group options
  const groupedOptions = useMemo(() => {
    const groups: Record<string, Option[]> = {};
    const ungrouped: Option[] = [];

    filteredOptions.forEach((opt) => {
      if (opt.group) {
        if (!groups[opt.group]) groups[opt.group] = [];
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    return { groups, ungrouped };
  }, [filteredOptions]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-9 pr-8 py-2.5 border rounded-xl text-sm transition-all outline-none ${
            disabled
              ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
          }`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {value && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden duration-100 max-h-64 overflow-y-auto custom-scrollbar">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">
              No se encontraron resultados para "{search}"
            </div>
          ) : (
            <div className="p-1">
              {/* Ungrouped Options */}
              {groupedOptions.ungrouped.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                    value === opt.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                  {value === opt.id && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                  )}
                </button>
              ))}

              {/* Grouped Options */}
              {Object.entries(groupedOptions.groups).map(([group, opts]) => (
                <div key={group} className="mt-1 first:mt-0">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50 rounded-md mb-1 mx-1">
                    {group}
                  </div>
                  {opts.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group mx-1 mb-0.5 ${
                        value === opt.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate opacity-80">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                      {value === opt.id && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function NewEquipmentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([]);
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacionId: "",
    categoria: "",
    tipoEquipoId: "",
    marca: "",
    modelo: "",
    serie: "",
    inventario: "",
    imageUrl: "",
    esCritico: false,
    pautaId: "",
    notas: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [ubicacionesData, tiposData, pautasData] = await Promise.all([
          getUbicaciones(),
          getTiposEquipo(),
          getPautas(),
        ]);
        setUbicaciones(ubicacionesData);
        setTiposEquipo(tiposData);
        setPautas(pautasData.filter((p: any) => p.activo));
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Prepare Options for Selects
  const ubicacionOptions = useMemo(
    () =>
      ubicaciones.map((u) => ({
        id: u.id,
        label: u.area,
        group: u.establecimiento,
      })),
    [ubicaciones]
  );

  const categories = useMemo(() => {
    const cats = new Set(tiposEquipo.map((t) => t.categoria));
    return Array.from(cats).map((c) => ({ id: c, label: c }));
  }, [tiposEquipo]);

  const tipoOptions = useMemo(() => {
    if (!formData.categoria) return [];
    return tiposEquipo
      .filter((t) => t.categoria === formData.categoria)
      .map((t) => ({
        id: t.id,
        label: t.subcategoria,
        sublabel: t.codigo,
      }));
  }, [tiposEquipo, formData.categoria]);

  const pautaOptions = useMemo(
    () =>
      pautas.map((p) => ({
        id: p.id,
        label: p.nombre,
        sublabel: `[${p.codigo}] ${p.periodicidadBase}`,
      })),
    [pautas]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor seleccione una imagen válida");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede superar los 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.ubicacionId || !formData.tipoEquipoId) {
      toast.error("Complete los campos requeridos");
      return;
    }

    setSubmitting(true);

    try {
      await createEquipo({
        nombre: formData.nombre,
        ubicacionId: formData.ubicacionId,
        tipoEquipoId: formData.tipoEquipoId,
        modelo: formData.modelo,
        serie: formData.serie,
        imageUrl: formData.imageUrl,
      });
      toast.success("Equipo creado exitosamente");
      router.push("/equipos");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear equipo");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin w-5 h-5" />
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header with Actions */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/equipos"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Nuevo Equipo
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Registro de activo en inventario
              </p>
            </div>
          </div>

          {/* Actions in Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/equipos"
              className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors font-medium text-sm"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              form="new-equipment-form"
              disabled={submitting}
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
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-6 py-8">
        <form
          id="new-equipment-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* LEFT: Image Upload (3/12) - Widened from 2 */}
            <div className="xl:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Fotografía
                </h2>

                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden mb-4 relative group">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={removeImage}
                            className="p-2 bg-slate-900/80 dark:bg-slate-700/80 border border-slate-700 dark:border-slate-600 text-white rounded-full hover:bg-red-500 hover:border-red-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium block">
                          Sin imagen
                        </span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />

                  <label
                    htmlFor="image-upload"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors cursor-pointer text-xs font-bold shadow-sm mb-3"
                  >
                    <Upload className="w-3 h-3" />
                    Subir
                  </label>

                  <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-3">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value || null);
                      }}
                      placeholder="URL imagen..."
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-slate-50/50 dark:bg-slate-800/50 shadow-sm transition-all text-slate-600 dark:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Info (10/12) */}
            <div className="xl:col-span-9 space-y-8">
              {/* Basic Info */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-500" />
                    Información Básica del Activo
                  </h2>

                  <label className="flex items-center gap-2 cursor-pointer group px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.esCritico}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            esCritico: e.target.checked,
                          })
                        }
                        className="peer w-4 h-4 border-slate-300 rounded text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                      {formData.esCritico ? (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      ) : null}
                      Equipo Crítico
                    </span>
                  </label>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                      Nombre del Equipo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      placeholder="Ej: DEA Procedimientos 1 CAR"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <Combobox
                        label="Ubicación"
                        required
                        value={formData.ubicacionId}
                        onChange={(val) =>
                          setFormData({ ...formData, ubicacionId: val })
                        }
                        options={ubicacionOptions}
                        placeholder="Seleccione ubicación..."
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Combobox
                        label="Categoría"
                        required
                        value={formData.categoria}
                        onChange={(val) =>
                          setFormData({
                            ...formData,
                            categoria: val,
                            tipoEquipoId: "",
                          })
                        }
                        options={categories}
                        placeholder="Filtrar por categoría..."
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Combobox
                        label="Tipo de Equipo"
                        required
                        value={formData.tipoEquipoId}
                        onChange={(val) =>
                          setFormData({ ...formData, tipoEquipoId: val })
                        }
                        options={tipoOptions}
                        placeholder={
                          formData.categoria
                            ? "Seleccione tipo..."
                            : "Primero seleccione categoría"
                        }
                        disabled={!formData.categoria}
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) =>
                          setFormData({ ...formData, marca: e.target.value })
                        }
                        placeholder="Ej: NIHON KOHDEN"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                        Modelo
                      </label>
                      <input
                        type="text"
                        value={formData.modelo}
                        onChange={(e) =>
                          setFormData({ ...formData, modelo: e.target.value })
                        }
                        placeholder="Ej: TEC-5531E"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                        N° Serie
                      </label>
                      <input
                        type="text"
                        value={formData.serie}
                        onChange={(e) =>
                          setFormData({ ...formData, serie: e.target.value })
                        }
                        placeholder="Ej: 935"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                        N° Inventario
                      </label>
                      <input
                        type="text"
                        value={formData.inventario}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inventario: e.target.value,
                          })
                        }
                        placeholder="Ej: INV-2024-001"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pauta & Notes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pauta */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col">
                  <div className="flex flex-col mb-6">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Pauta de Mantención
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Se aplicará automáticamente al programar mantenciones.
                    </p>
                  </div>

                  <div className="mb-4">
                    <Combobox
                      label="Pauta Preseleccionada"
                      value={formData.pautaId}
                      onChange={(val) =>
                        setFormData({ ...formData, pautaId: val })
                      }
                      options={pautaOptions}
                      placeholder="Buscar pauta por nombre o código..."
                    />
                  </div>

                  {formData.pautaId && (
                    <div className="mt-auto p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl flex gap-3 items-start">
                      <Info className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-0.5">
                          Pauta Vinculada
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
                          Esta pauta será sugerida por defecto. Puede cambiarla
                          en cada mantención si es necesario.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col h-full">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    Observaciones
                  </h2>
                  <textarea
                    value={formData.notas}
                    onChange={(e) =>
                      setFormData({ ...formData, notas: e.target.value })
                    }
                    placeholder="Información adicional, estado físico, detalles de garantía..."
                    className="w-full flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[120px] text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
