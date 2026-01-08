"use client";

import { useState, useEffect } from "react";
import {
  createCatalogo,
  updateCatalogo,
  deleteCatalogo,
  seedCatalogos,
  getCatalogos,
} from "../../../actions/parametros";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Briefcase,
  Search,
  Settings,
  Database,
} from "lucide-react";
import UbicacionesTree from "./UbicacionesTree";

interface CatalogoItem {
  id: string;
  tipo: string;
  valor: string;
  descripcion?: string | null;
  activo: boolean;
}

interface ParametrosContentProps {
  currentUser: {
    id: string;
    rol: string;
  };
}

export default function ParametrosContent({
  currentUser,
}: ParametrosContentProps) {
  const [activeTab, setActiveTab] = useState<"CARGO" | "UBICACION">("CARGO");
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
  const [formData, setFormData] = useState({
    valor: "",
    descripcion: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === "CARGO") {
      fetchItems();
    }
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getCatalogos(activeTab);
      // @ts-ignore
      setItems(data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ valor: "", descripcion: "" });
    setShowModal(true);
  };

  const handleEdit = (item: CatalogoItem) => {
    setEditingItem(item);
    setFormData({
      valor: item.valor,
      descripcion: item.descripcion || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;

    try {
      await deleteCatalogo(id);
      toast.success("Registro eliminado");
      fetchItems();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateCatalogo(editingItem.id, {
          valor: formData.valor,
          descripcion: formData.descripcion,
        });
        toast.success("Actualizado correctamente");
      } else {
        await createCatalogo({
          tipo: activeTab,
          valor: formData.valor,
          descripcion: formData.descripcion,
        });
        toast.success("Creado correctamente");
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (
      !confirm(
        `¿Deseas cargar los valores por defecto para Cargos? Esto no borrará los existentes.`
      )
    )
      return;

    setLoading(true);
    try {
      const result = await seedCatalogos(activeTab);
      toast.success(`Se agregaron ${result.count} registros nuevos`);
      fetchItems();
    } catch (error) {
      toast.error("Error al cargar valores por defecto");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.valor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Administración de Parámetros
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona los listados y configuraciones generales del sistema
          </p>
        </div>

        {/* Tabs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Cargos Card */}
          <button
            onClick={() => setActiveTab("CARGO")}
            className={`p-6 rounded-2xl border text-left transition-all duration-200 group ${
              activeTab === "CARGO"
                ? "bg-white dark:bg-slate-800 border-blue-500 ring-1 ring-blue-500 shadow-md"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                activeTab === "CARGO"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500"
              }`}
            >
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Cargos
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona los cargos y roles laborales disponibles para los
              usuarios
            </p>
          </button>

          {/* Ubicaciones Tab Button */}
          <button
            onClick={() => setActiveTab("UBICACION")}
            className={`p-6 rounded-2xl border text-left transition-all duration-200 group ${
              activeTab === "UBICACION"
                ? "bg-white dark:bg-slate-800 border-indigo-500 ring-1 ring-indigo-500 shadow-md"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                activeTab === "UBICACION"
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-500"
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Ubicaciones
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona Establecimientos y sus Áreas
            </p>
          </button>
        </div>

        {/* Dynamic Content */}
        {activeTab === "UBICACION" ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-fade-in">
            <UbicacionesTree />
          </div>
        ) : (
          /* List Content for Catalogo */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Listado de {activeTab === "CARGO" ? "Cargos" : "Items"}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {filteredItems.length}
                </span>
              </h2>

              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Table */}
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No se encontraron registros
                </p>
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                ) : (
                  <button
                    onClick={handleSeed}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    Cargar valores por defecto
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Descripción</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {item.valor}
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                          {item.descripcion || "-"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              {editingItem ? "Editar" : "Nuevo"} Item
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  autoFocus
                  placeholder="Ej: Kinesiólogo"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Opcional..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
