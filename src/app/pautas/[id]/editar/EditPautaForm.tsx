"use client";

import { useState } from "react";
import { updatePauta, deletePauta } from "../../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Users,
  Building,
  Cog,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type TipoPauta = "RECURSO_HUMANO" | "INFRAESTRUCTURA" | "EQUIPAMIENTO";

const TIPO_PAUTA_CONFIG: Record<
  TipoPauta,
  {
    short: string;
    full: string;
    bgColor: string;
    textColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  RECURSO_HUMANO: {
    short: "RH",
    full: "Recurso Humano",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: Users,
  },
  INFRAESTRUCTURA: {
    short: "INS",
    full: "Infraestructura",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-400",
    icon: Building,
  },
  EQUIPAMIENTO: {
    short: "EQ",
    full: "Equipamiento",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-400",
    icon: Cog,
  },
};

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  periodicidadBase: string;
  tipo?: TipoPauta | null;
}

interface Props {
  pauta: Pauta;
}

export default function EditPautaForm({ pauta }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    codigo: pauta.codigo,
    nombre: pauta.nombre,
    descripcion: pauta.descripcion || "",
    periodicidadBase: pauta.periodicidadBase,
    tipo: (pauta.tipo || "EQUIPAMIENTO") as TipoPauta,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombre) {
      toast.error("Complete los campos requeridos");
      return;
    }

    setSubmitting(true);

    try {
      await updatePauta(pauta.id, {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        periodicidadBase: formData.periodicidadBase as any,
        tipo: formData.tipo,
      });

      toast.success("Pauta actualizada exitosamente");
      router.push(`/pautas/${pauta.id}`);
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
      const result = await deletePauta(pauta.id, forceDelete);

      // Si la pauta está en uso y no se puede eliminar, se marcó como inactiva
      if (result.cannotDelete) {
        toast.info(
          result.message ||
            `La pauta "${result.pautaNombre}" está en desuso y ha sido marcada como INACTIVA.`,
          {
            duration: 6000,
          }
        );
        setShowDeleteConfirm(false);
        router.push(`/pautas/${pauta.id}`);
        router.refresh();
        return;
      }

      if (result.requiresConfirmation) {
        // Mostrar mensaje y preguntar si quiere forzar
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

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Información General
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Datos básicos de la pauta de mantención
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Pauta */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
              Tipo de Pauta <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                Object.entries(TIPO_PAUTA_CONFIG) as [
                  TipoPauta,
                  (typeof TIPO_PAUTA_CONFIG)[TipoPauta]
                ][]
              ).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.tipo === value
                        ? `${config.bgColor} ${config.textColor} border-current shadow-sm`
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={value}
                      checked={formData.tipo === value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo: e.target.value as TipoPauta,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`p-2.5 rounded-lg ${
                        formData.tipo === value
                          ? "bg-white/50 dark:bg-black/20"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-lg font-bold">{config.short}</span>
                      <p className="text-xs opacity-80">{config.full}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
                placeholder="Ej: PAU-001"
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
                placeholder="Nombre de la pauta"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 transition-colors resize-none"
              placeholder="Descripción de la pauta..."
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
          </div>

          {/* Periodicidad */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
              Periodicidad Base
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { value: "MENSUAL", label: "Mensual" },
                { value: "BIMESTRAL", label: "Bimestral" },
                { value: "TRIMESTRAL", label: "Trimestral" },
                { value: "SEMESTRAL", label: "Semestral" },
                { value: "ANUAL", label: "Anual" },
                { value: "NO_APLICA", label: "No Aplica" },
              ].map((per) => (
                <label
                  key={per.value}
                  className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.periodicidadBase === per.value
                      ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="periodicidad"
                    value={per.value}
                    checked={formData.periodicidadBase === per.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        periodicidadBase: e.target.value,
                      })
                    }
                    className="sr-only"
                  />
                  <span className="text-sm font-bold">{per.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold flex items-center gap-2 rounded-xl"
            >
              <Trash2 className="w-5 h-5" />
              Eliminar Pauta
            </button>
            <div className="flex gap-3">
              <Link
                href={`/pautas/${pauta.id}`}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold rounded-xl"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
        </form>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 shadow-xl w-full max-w-md rounded-2xl overflow-hidden">
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
    </>
  );
}
