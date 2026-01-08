"use client";

import { useState } from "react";
import { scheduleMantencion } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  Cpu,
  ClipboardList,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Loader2,
  FileCheck,
  ArrowLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Ubicacion {
  id: string;
  establecimiento: string;
  area: string;
  equipos: any[];
}

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  periodicidadBase?: string;
}

interface Props {
  equipoInicial: any | null;
  equipos: any[];
  pautas: Pauta[];
  ubicacionesPorEstablecimiento: Record<string, Ubicacion[]>;
  fechaInicial?: string;
}

export default function ScheduleMaintenanceForm({
  equipoInicial,
  equipos,
  pautas,
  ubicacionesPorEstablecimiento,
  fechaInicial,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Inicializar fecha
  const initializeFecha = () => {
    if (fechaInicial) return fechaInicial;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedEstablecimiento, setSelectedEstablecimiento] =
    useState<string>(equipoInicial?.ubicacion?.establecimiento || "");
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>(
    equipoInicial?.id || ""
  );
  const [selectedPautaId, setSelectedPautaId] = useState<string>("");
  const [fecha, setFecha] = useState(initializeFecha());
  const [datePrecision, setDatePrecision] = useState<"day" | "month">("day");
  const [tipoMantencion, setTipoMantencion] = useState("PREVENTIVO");
  const [observaciones, setObservaciones] = useState("");

  const [searchEquipo, setSearchEquipo] = useState("");
  const [searchPauta, setSearchPauta] = useState("");

  const equiposDelEstablecimiento = selectedEstablecimiento
    ? equipos.filter(
        (eq) => eq.ubicacion?.establecimiento === selectedEstablecimiento
      )
    : [];

  const equiposFiltrados = equiposDelEstablecimiento.filter(
    (eq) =>
      searchEquipo === "" ||
      eq.nombre?.toLowerCase().includes(searchEquipo.toLowerCase()) ||
      eq.modelo?.toLowerCase().includes(searchEquipo.toLowerCase()) ||
      eq.ubicacion?.area?.toLowerCase().includes(searchEquipo.toLowerCase())
  );

  const pautasFiltradas = pautas.filter(
    (p) =>
      searchPauta === "" ||
      p.codigo?.toLowerCase().includes(searchPauta.toLowerCase()) ||
      p.nombre?.toLowerCase().includes(searchPauta.toLowerCase())
  );

  const equipoSeleccionado = equipos.find((eq) => eq.id === selectedEquipoId);
  const pautaSeleccionada = pautas.find((p) => p.id === selectedPautaId);
  const establecimientos = Object.keys(ubicacionesPorEstablecimiento).sort();

  const fechaSeleccionada = new Date(`${fecha}T12:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const esFechaFutura = fechaSeleccionada > hoy;

  // Conflict Logic - Detailed
  const getConflictWarning = () => {
    if (!equipoSeleccionado || !equipoSeleccionado.mantenciones?.length)
      return null;

    const maintenanceHistory = equipoSeleccionado.mantenciones;
    const selectedDate = new Date(`${fecha}T12:00:00`);

    // Check for ANY pending maintenance
    const pendingMaintenance = maintenanceHistory.find(
      (m: any) => m.estadoMantencion === "PENDIENTE"
    );

    if (pendingMaintenance) {
      return {
        type: "danger",
        title: "Este equipo tiene una mantención PENDIENTE",
        details: [
          `Programada: ${new Date(pendingMaintenance.fecha).toLocaleDateString(
            "es-CL"
          )}`,
          `Tipo: ${pendingMaintenance.tipoMantencion}`,
        ],
      };
    }

    // Check for recent completed (last 30 days) or future scheduled
    const conflicting = maintenanceHistory.find((m: any) => {
      const mDate = new Date(m.fecha);
      const diffTime = Math.abs(selectedDate.getTime() - mDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays < 30; // Warn if any maintenance within 30 days
    });

    if (conflicting) {
      const confDate = new Date(conflicting.fecha);
      const isFuture = confDate > new Date();
      return {
        type: "warning",
        title: isFuture
          ? "Existe una mantención programada cercana"
          : "Mantención realizada recientemente",
        details: [
          `Fecha: ${confDate.toLocaleDateString("es-CL")}`,
          `Estado: ${conflicting.estadoMantencion}`,
          `Tipo: ${conflicting.tipoMantencion}`,
        ],
      };
    }

    return null;
  };

  // ... (getConflictWarning remains)

  const conflict = getConflictWarning();

  const handleSubmit = async () => {
    if (!selectedEquipoId || !fecha || !selectedPautaId) {
      toast.error("Faltan datos requeridos");
      return;
    }

    setSubmitting(true);
    try {
      await scheduleMantencion({
        fecha: fecha,
        equipoId: selectedEquipoId,
        pautaId: selectedPautaId || undefined,
        tipoMantencion: tipoMantencion as any,
        observaciones: observaciones || undefined,
      });

      toast.success("Orden creada exitosamente");
      window.location.href = `/planificacion?fecha=${fecha}`;
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la orden");
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedEstablecimiento) {
      toast.error("Seleccione un centro");
      return;
    }
    if (currentStep === 2 && !selectedEquipoId) {
      toast.error("Seleccione un equipo");
      return;
    }
    if (currentStep === 3 && !fecha) {
      toast.error("Seleccione una fecha");
      return;
    }
    if (currentStep === 3 && !selectedPautaId) {
      toast.error("Seleccione una pauta");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSelectEstablecimiento = (est: string) => {
    setSelectedEstablecimiento(est);
    // Auto-advance
    setTimeout(() => setCurrentStep(2), 150);
  };

  const handleSelectEquipo = (id: string) => {
    setSelectedEquipoId(id);
    // Auto-advance
    setTimeout(() => setCurrentStep(3), 150);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* ... (Header remains same) ... */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/planificacion"
            className="p-1.5 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Nueva Orden
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Paso {currentStep} de 4
            </p>
          </div>
        </div>

        {/* Progress Bar - Compact */}
        <div className="relative h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-blue-600 rounded-full"
            initial={{ width: "25%" }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Content Card - Compact */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[450px] flex flex-col">
        <div className="flex-1 p-5">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Seleccione Centro
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {establecimientos.map((est) => (
                    <button
                      key={est}
                      onClick={() => handleSelectEstablecimiento(est)}
                      className={`text-left p-3.5 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        selectedEstablecimiento === est
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-500"
                          : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p
                            className={`font-semibold text-base ${
                              selectedEstablecimiento === est
                                ? "text-blue-700 dark:text-blue-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {est}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            {
                              equipos.filter(
                                (e) => e.ubicacion?.establecimiento === est
                              ).length
                            }{" "}
                            equipos checkeables
                          </p>
                        </div>
                        {selectedEstablecimiento === est && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-500" />
                    Seleccione Equipo
                  </h2>
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full uppercase tracking-wider">
                    {selectedEstablecimiento}
                  </span>
                </div>

                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={searchEquipo}
                    onChange={(e) => setSearchEquipo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px] border rounded-xl border-slate-100 dark:border-slate-800 custom-scrollbar">
                  {equiposFiltrados.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <p>No se encontraron equipos</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-3 border-b border-slate-100 dark:border-slate-800">
                            Nombre / Serie
                          </th>
                          <th className="p-3 border-b border-slate-100 dark:border-slate-800 text-right">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {equiposFiltrados.map((eq) => (
                          <tr
                            key={eq.id}
                            onClick={() => handleSelectEquipo(eq.id)}
                            className={`cursor-pointer transition-colors group ${
                              selectedEquipoId === eq.id
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <td className="p-3">
                              <div className="font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                                {eq.nombre}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span className="font-mono bg-slate-100 px-1 rounded">
                                  {eq.serie || "S/N"}
                                </span>
                                <span>• {eq.ubicacion?.area}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right align-top">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                  eq.estado === "OPERATIVO"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {eq.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-emerald-500" />
                    Detalles
                  </h2>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {equipoSeleccionado?.nombre}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {equipoSeleccionado?.ubicacion?.area}
                    </p>
                  </div>
                </div>

                {/* Conflict Warning - Detailed */}
                {conflict && (
                  <div
                    className={`p-4 rounded-xl flex items-start gap-4 text-sm shadow-sm ${
                      conflict.type === "danger"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        conflict.type === "danger"
                          ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                          : "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <p className="font-bold text-base mb-1">
                        {conflict.title}
                      </p>
                      <ul className="space-y-1 text-xs opacity-90 list-disc list-inside">
                        {conflict.details?.map((detail: string, i: number) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Tipo
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setTipoMantencion("PREVENTIVO")}
                        className={`flex-1 py-2 text-xs font-bold transition-colors ${
                          tipoMantencion === "PREVENTIVO"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        Prev.
                      </button>
                      <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                      <button
                        onClick={() => setTipoMantencion("CORRECTIVO")}
                        className={`flex-1 py-2 text-xs font-bold transition-colors ${
                          tipoMantencion === "CORRECTIVO"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        Corr.
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Pauta <span className="text-red-500">*</span>
                  </label>

                  {selectedPautaId ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                          {pautaSeleccionada?.nombre}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          {pautaSeleccionada?.codigo}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPautaId("")}
                        className="text-emerald-400 hover:text-red-500 ml-2"
                      >
                        <div className="bg-white rounded-full p-0.5">
                          <Check className="w-3 h-3 rotate-45" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar pauta..."
                          value={searchPauta}
                          onChange={(e) => setSearchPauta(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>

                      {searchPauta && (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                          {pautasFiltradas.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-sm">
                              <p>No se encontraron pautas</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {pautasFiltradas.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    setSelectedPautaId(p.id);
                                    setSearchPauta("");
                                  }}
                                  className="w-full text-left p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group"
                                >
                                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                                    {p.nombre}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {p.codigo}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Observaciones
                  </label>
                  <textarea
                    rows={2}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                    placeholder="..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ClipboardList className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Confirmar
                </h2>

                <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left border border-slate-100 dark:border-slate-700 text-sm space-y-3">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Equipo
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[60%] truncate">
                      {equipoSeleccionado?.nombre}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Fecha
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(`${fecha}T12:00:00`).toLocaleDateString(
                        "es-CL"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">
                      Tipo
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {tipoMantencion}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer - Compact */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <button
            onClick={handleBack}
            className={`text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium px-4 py-2 transition-opacity ${
              currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            Atrás
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="bg-slate-900 text-white rounded-lg px-6 py-2.5 font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2 text-sm"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white rounded-lg px-6 py-2.5 font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Confirmar <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
