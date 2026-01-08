"use client";

import { useState, useEffect } from "react";
import { scheduleMantencion } from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  equipos: any[];
  pautas?: any[];
  initialEquipoId?: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  selectedDate,
  equipos,
  pautas = [],
  initialEquipoId,
}: ScheduleModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [datePrecision, setDatePrecision] = useState<"day" | "month">("day");
  const [formData, setFormData] = useState({
    equipoId: "",
    pautaId: "",
    tipoMantencion: "PREVENTIVO",
    observaciones: "",
    fecha: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        equipoId: initialEquipoId || "",
        pautaId: pautas[0]?.id || "",
        tipoMantencion: "PREVENTIVO",
        observaciones: "",
        fecha: selectedDate
          ? selectedDate.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
      setSearchTerm("");
    }
  }, [isOpen, pautas, initialEquipoId, selectedDate]);

  if (!isOpen) return null;

  const filteredEquipos = equipos.filter(
    (eq) =>
      eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.ubicacion?.establecimiento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      eq.ubicacion?.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipoId || !formData.fecha) {
      toast.error("Seleccione un equipo y una fecha");
      return;
    }

    setLoading(true);
    try {
      await scheduleMantencion({
        fecha: formData.fecha,
        equipoId: formData.equipoId,
        pautaId: formData.pautaId || undefined,
        tipoMantencion: formData.tipoMantencion as any,
        observaciones: formData.observaciones || undefined,
      });

      toast.success("Mantención programada correctamente");
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al programar mantención");
    } finally {
      setLoading(false);
    }
  };

  const selectedEquipo = equipos.find((eq) => eq.id === formData.equipoId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Programar Mantención
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedDate?.toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>

            {/* Toggle Precisión */}
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-2 w-fit">
              <button
                type="button"
                onClick={() => setDatePrecision("day")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  datePrecision === "day"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Día Específico
              </button>
              <button
                type="button"
                onClick={() => setDatePrecision("month")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  datePrecision === "month"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Mes Completo
              </button>
            </div>

            <input
              type={datePrecision === "day" ? "date" : "month"}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={
                datePrecision === "month"
                  ? formData.fecha.substring(0, 7)
                  : formData.fecha
              }
              onChange={(e) => {
                let val = e.target.value;
                if (datePrecision === "month" && val) {
                  // Si es mes, guardar como el día 1 del mes
                  val = `${val}-01`;
                }
                setFormData({ ...formData, fecha: val });
              }}
              required
            />
            {datePrecision === "month" && (
              <p className="mt-1 text-xs text-slate-500">
                Se agendará para el 1° de{" "}
                {new Date(formData.fecha).toLocaleDateString("es-CL", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Búsqueda de equipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Equipo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Buscar equipo..."
              className="w-full p-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600">
              {filteredEquipos.slice(0, 10).map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, equipoId: eq.id });
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    formData.equipoId === eq.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {eq.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    {eq.ubicacion?.establecimiento} · {eq.ubicacion?.area}
                  </p>
                </button>
              ))}
              {filteredEquipos.length === 0 && (
                <p className="text-center py-4 text-slate-500 text-sm">
                  No se encontraron equipos
                </p>
              )}
            </div>
            {selectedEquipo && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Seleccionado: {selectedEquipo.nombre}
                </p>
              </div>
            )}
          </div>

          {/* Tipo de mantención */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Mantención
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tipoMantencion"
                  value="PREVENTIVO"
                  checked={formData.tipoMantencion === "PREVENTIVO"}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoMantencion: e.target.value })
                  }
                  className="text-blue-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Preventivo
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tipoMantencion"
                  value="CORRECTIVO"
                  checked={formData.tipoMantencion === "CORRECTIVO"}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoMantencion: e.target.value })
                  }
                  className="text-blue-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Correctivo
                </span>
              </label>
            </div>
          </div>

          {/* Pauta (opcional) */}
          {pautas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Pauta de Mantención (opcional)
              </label>
              <select
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.pautaId}
                onChange={(e) =>
                  setFormData({ ...formData, pautaId: e.target.value })
                }
              >
                <option value="">Sin pauta específica</option>
                {pautas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Observaciones
            </label>
            <textarea
              className="w-full p-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Notas adicionales..."
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.equipoId}
              variant="primary"
              icon={
                loading ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )
              }
            >
              {loading ? "Programando..." : "Programar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
