"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePauta, togglePautaActivo } from "@/app/actions/pautas";
import { toast } from "sonner";
import {
  FileText,
  ListTodo,
  Activity,
  Edit2,
  Power,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  periodicidadBase: string;
  tipo?: string;
  activo: boolean;
  _count?: {
    items: number;
    mantenciones: number;
  };
}

// Etiquetas y colores para tipos de pauta
const TIPO_PAUTA_CONFIG: Record<
  string,
  { short: string; full: string; bgColor: string; textColor: string }
> = {
  RECURSO_HUMANO: {
    short: "RH",
    full: "Recurso Humano",
    bgColor: "bg-violet-500",
    textColor: "text-white",
  },
  INFRAESTRUCTURA: {
    short: "INS",
    full: "Infraestructura",
    bgColor: "bg-cyan-500",
    textColor: "text-white",
  },
  EQUIPAMIENTO: {
    short: "EQ",
    full: "Equipamiento",
    bgColor: "bg-orange-500",
    textColor: "text-white",
  },
};

interface PautasListProps {
  pautas: Pauta[];
  periodicidadColors: Record<string, string>;
  periodicidadLabels: Record<string, string>;
  userRole?: string;
}

export default function PautasList({
  pautas,
  periodicidadColors,
  periodicidadLabels,
  userRole = "VISUALIZADOR",
}: PautasListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState<{
    id: string;
    count: number;
  } | null>(null);

  // Solo ADMINISTRADOR y REGISTRADOR pueden editar/eliminar
  const canEdit = userRole === "ADMINISTRADOR" || userRole === "REGISTRADOR";

  const handleDelete = async (pautaId: string, force: boolean = false) => {
    startTransition(async () => {
      try {
        const result = await deletePauta(pautaId, force);

        // Si la pauta está en uso y no se puede eliminar, se marcó como inactiva
        if (result.cannotDelete) {
          toast.info(
            result.message ||
              `La pauta "${result.pautaNombre}" está en desuso y ha sido marcada como INACTIVA.`,
            {
              duration: 6000,
            }
          );
          setDeleteConfirm(null);
          setForceDeleteConfirm(null);
          router.refresh();
          return;
        }

        if (result.requiresConfirmation) {
          setDeleteConfirm(null);
          setForceDeleteConfirm({
            id: pautaId,
            count: (result.mantencionesCount || 0) + (result.equiposCount || 0),
          });
          return;
        }

        toast.success("Pauta eliminada correctamente");
        setDeleteConfirm(null);
        setForceDeleteConfirm(null);
        router.refresh();
      } catch (error) {
        console.error("Error deleting pauta:", error);
        toast.error("Error al eliminar la pauta");
      }
    });
  };

  const handleToggleActivo = async (pautaId: string) => {
    startTransition(async () => {
      try {
        await togglePautaActivo(pautaId);
        toast.success("Estado actualizado");
        router.refresh();
      } catch (error) {
        console.error("Error toggling pauta:", error);
        toast.error("Error al cambiar el estado");
      }
    });
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pautas.map((pauta, index) => (
          <div
            key={pauta.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden group transition-all duration-300 hover:shadow-lg animate-slide-up flex flex-col ${
              isPending ? "opacity-60 pointer-events-none" : ""
            } ${
              pauta.activo
                ? "border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 opacity-75 hover:opacity-100"
            }`}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards",
            }}
          >
            <Link
              href={`/pautas/${pauta.id}`}
              className="flex-1 p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* Etiqueta de Tipo de Pauta */}
                  {pauta.tipo && TIPO_PAUTA_CONFIG[pauta.tipo] && (
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                        TIPO_PAUTA_CONFIG[pauta.tipo].bgColor
                      } ${TIPO_PAUTA_CONFIG[pauta.tipo].textColor} shadow-sm`}
                      title={TIPO_PAUTA_CONFIG[pauta.tipo].full}
                    >
                      {TIPO_PAUTA_CONFIG[pauta.tipo].short}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 tracking-wide">
                    {pauta.codigo}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    pauta.activo
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20 dark:ring-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-500/20 dark:ring-slate-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      pauta.activo
                        ? "bg-emerald-500"
                        : "bg-slate-400 dark:bg-slate-600"
                    }`}
                  ></span>
                  {pauta.activo ? " ACTIVA" : " INACTIVA"}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2 leading-tight">
                {pauta.nombre}
              </h3>

              {pauta.descripcion && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                  {pauta.descripcion}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                    periodicidadColors[pauta.periodicidadBase]
                  }`}
                >
                  {periodicidadLabels[pauta.periodicidadBase] ||
                    pauta.periodicidadBase}
                </span>

                <div className="flex items-center gap-3 ml-auto">
                  <span
                    className="flex items-center gap-1.5"
                    title="Items en checklist"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span className="font-semibold">
                      {pauta._count?.items || 0}
                    </span>
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    title="Mantenciones realizadas"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span className="font-semibold">
                      {pauta._count?.mantenciones || 0}
                    </span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Acciones - Solo para ADMINISTRADOR y REGISTRADOR */}
            {canEdit && (
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Link
                  href={`/pautas/${pauta.id}/editar`}
                  className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
                >
                  <Edit2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  Editar
                </Link>

                <button
                  onClick={() => handleToggleActivo(pauta.id)}
                  disabled={isPending}
                  className={`flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors group/btn ${
                    pauta.activo
                      ? "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  }`}
                >
                  <Power className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  {pauta.activo ? "Desactivar" : "Activar"}
                </button>

                <button
                  onClick={() => setDeleteConfirm(pauta.id)}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/btn"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ¿Eliminar pauta?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">
                Esta acción eliminará la pauta y su checklist permanentemente.
                No se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm, false)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-sm shadow-sm shadow-red-200 dark:shadow-none"
              >
                {isPending ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación forzada */}
      {forceDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pauta en uso
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Esta pauta tiene <strong>{forceDeleteConfirm.count}</strong>{" "}
                  registros asociados (mantenciones o equipos).
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl mb-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                  Si continúa, las mantenciones quedarán sin pauta asignada,
                  pero <strong>no se eliminarán</strong>. La pauta se borrará
                  permanentemente.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setForceDeleteConfirm(null)}
                disabled={isPending}
                className="px-5 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(forceDeleteConfirm.id, true)}
                disabled={isPending}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-bold text-sm shadow-sm shadow-red-200 dark:shadow-none"
              >
                {isPending ? "Procesando..." : "Desvincular y Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
