"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SignatureModal from "./SignatureModal";
import { deleteMantencion, updateMantencionFecha } from "../../actions";
import { Button } from "@/app/components/ui/Button";
import { Plus, Calendar, Eye, Trash2, Check, X } from "lucide-react";

interface DayMaintenanceListProps {
  date: Date;
  records: any[];
  onScheduleNew: () => void;
  onRefresh: () => void;
}

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const fullDayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function DayMaintenanceList({
  date,
  records,
  onScheduleNew,
  onRefresh,
}: DayMaintenanceListProps) {
  const router = useRouter();
  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean;
    mantencionId: string;
    equipoName: string;
  }>({ isOpen: false, mantencionId: "", equipoName: "" });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFecha, setEditFecha] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteMantencion = async (id: string) => {
    setDeleting(id);
    try {
      await deleteMantencion(id);
      toast.success("Mantención eliminada");
      onRefresh();
    } catch (error) {
      toast.error("Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  const handleConfirmDelete = (id: string, equipoName: string) => {
    toast(
      <div className="flex flex-col gap-2">
        <p className="font-medium text-sm">¿Eliminar mantención?</p>
        <p className="text-xs text-slate-600">{equipoName}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              handleDeleteMantencion(id);
              toast.dismiss();
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-300 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>,
      { duration: 10000, position: "top-center" }
    );
  };

  const handleEditFecha = (id: string, currentFecha: Date) => {
    const fechaStr = new Date(currentFecha).toISOString().split("T")[0];
    setEditingId(id);
    setEditFecha(fechaStr);
  };

  const handleSaveFecha = async (id: string) => {
    try {
      await updateMantencionFecha(id, editFecha);
      toast.success("Fecha actualizada");
      setEditingId(null);
      onRefresh();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFecha("");
  };

  const handleViewDocument = (record: any) => {
    router.push(`/mantenciones/${record.id}/visualizar`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETADA":
        return {
          label: "Completada",
          color: "text-emerald-700 dark:text-emerald-300",
          bg: "bg-emerald-50 dark:bg-emerald-950/50",
          border: "border-l-emerald-500 dark:border-l-emerald-500",
        };
      case "EN_PROCESO":
        return {
          label: "En Proceso",
          color: "text-blue-700 dark:text-blue-300",
          bg: "bg-blue-50 dark:bg-blue-950/50",
          border: "border-l-blue-500 dark:border-l-blue-500",
        };
      case "PROGRAMADA":
        return {
          label: "Programada",
          color: "text-amber-700 dark:text-amber-300",
          bg: "bg-amber-50 dark:bg-amber-950/50",
          border: "border-l-amber-500 dark:border-l-amber-500",
        };
      default:
        return {
          label: status,
          color: "text-slate-700 dark:text-slate-300",
          bg: "bg-slate-50 dark:bg-slate-800",
          border: "border-l-slate-400 dark:border-l-slate-500",
        };
    }
  };

  const formattedDate = `${fullDayNames[date.getDay()]}, ${date.getDate()} de ${
    monthNames[date.getMonth()]
  }`;
  const isToday = new Date().toDateString() === date.toDateString();

  // Separate daily and monthly records
  const dailyRecords = records.filter((r) => new Date(r.fecha).getDate() !== 1);
  const monthlyRecords = records.filter(
    (r) => new Date(r.fecha).getDate() === 1
  );

  return (
    <>
      <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formattedDate}
            </h2>
            {isToday && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded uppercase tracking-wide">
                Hoy
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {records.length}{" "}
            {records.length === 1 ? "mantención" : "mantenciones"}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Sin mantenciones
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                No hay mantenciones programadas para este día
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={onScheduleNew}
                icon={<Plus className="w-4 h-4" />}
              >
                Agendar nueva
              </Button>
            </div>
          ) : (
            <>
              {/* Daily Records Section */}
              {dailyRecords.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                    Mantenciones del Día
                  </h3>
                  {dailyRecords.map((record) => {
                    const statusConfig = getStatusConfig(
                      record.estadoMantencion
                    );
                    return (
                      <div
                        key={record.id}
                        className={`bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer border-l-4 ${statusConfig.border}`}
                        onClick={() => handleViewDocument(record)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-sm mb-1 truncate">
                                {record.equipo?.nombre || "Sin nombre"}
                              </h4>
                              <p className="text-xs text-slate-500 truncate">
                                {record.equipo?.tipoEquipo?.subcategoria ||
                                  "Sin tipo"}
                              </p>
                            </div>
                            <Eye className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {record.tipoMantencion}
                            </span>
                          </div>

                          {record.pauta && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {record.pauta.nombre}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {record.estadoMantencion !== "COMPLETADA" && (
                          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
                            {editingId === record.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="date"
                                  value={editFecha}
                                  onChange={(e) => setEditFecha(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveFecha(record.id);
                                  }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFecha(record.id, record.fecha);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                  Cambiar Fecha
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmDelete(
                                      record.id,
                                      record.equipo?.nombre || ""
                                    );
                                  }}
                                  disabled={deleting === record.id}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Monthly Records Section */}
              {monthlyRecords.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pt-2">
                    Mensuales (Todo el mes)
                  </h3>
                  {monthlyRecords.map((record) => {
                    const statusConfig = getStatusConfig(
                      record.estadoMantencion
                    );
                    return (
                      <div
                        key={record.id}
                        className={`bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer border-l-4 ${statusConfig.border}`}
                        onClick={() => handleViewDocument(record)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 dark:text-slate-200 text-sm mb-1 truncate">
                                {record.equipo?.nombre || "Sin nombre"}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {record.equipo?.tipoEquipo?.subcategoria ||
                                  "Sin tipo"}
                              </p>
                            </div>
                            <Eye className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {record.tipoMantencion}
                            </span>
                          </div>

                          {record.pauta && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {record.pauta.nombre}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {record.estadoMantencion !== "COMPLETADA" && (
                          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
                            {editingId === record.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="date"
                                  value={editFecha}
                                  onChange={(e) => setEditFecha(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveFecha(record.id);
                                  }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFecha(record.id, record.fecha);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  Cambiar Fecha
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmDelete(
                                      record.id,
                                      record.equipo?.nombre || ""
                                    );
                                  }}
                                  disabled={deleting === record.id}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Quick Add */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleNew}
            icon={<Plus className="w-4 h-4" />}
            className="w-full"
          >
            Nueva Mantención
          </Button>
        </div>
      </div>

      <SignatureModal
        isOpen={signatureModal.isOpen}
        onClose={() =>
          setSignatureModal({ isOpen: false, mantencionId: "", equipoName: "" })
        }
        mantencionId={signatureModal.mantencionId}
        equipoName={signatureModal.equipoName}
        onSuccess={() => {
          setSignatureModal({
            isOpen: false,
            mantencionId: "",
            equipoName: "",
          });
          onRefresh();
        }}
      />
    </>
  );
}
