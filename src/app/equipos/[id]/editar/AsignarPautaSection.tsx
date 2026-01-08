"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMantencion } from "@/app/actions/mantenciones";
import { asignarPautaAEquipo } from "@/app/actions/equipos";
import { EstadoMantencion, TipoMantencion } from "@prisma/client";

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  periodicidadBase: string;
  _count: {
    items: number;
  };
}

interface PautaAsignada {
  id: string;
  codigo: string;
  nombre: string;
  periodicidadBase: string;
}

interface Mantencion {
  id: string;
  fecha: Date;
  estadoMantencion: string;
  pauta: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
}

interface Props {
  equipoId: string;
  equipoNombre: string;
  equipoEstado?: string;
  pautas: Pauta[];
  mantencionesPendientes: Mantencion[];
  pautaAsignada: PautaAsignada | null;
}

const PERIODICIDAD_LABELS: Record<string, string> = {
  MENSUAL: "Mensual",
  BIMESTRAL: "Bimestral",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
  NO_APLICA: "Sin periodicidad",
};

const PERIODICIDAD_COLORS: Record<string, string> = {
  MENSUAL: "bg-purple-100 text-purple-700",
  BIMESTRAL: "bg-indigo-100 text-indigo-700",
  TRIMESTRAL: "bg-blue-100 text-blue-700",
  SEMESTRAL: "bg-emerald-100 text-emerald-700",
  ANUAL: "bg-amber-100 text-amber-700",
  NO_APLICA: "bg-slate-100 text-slate-600",
};

export default function AsignarPautaSection({
  equipoId,
  equipoNombre,
  equipoEstado = "OPERATIVO",
  pautas,
  mantencionesPendientes,
  pautaAsignada,
}: Props) {
  const router = useRouter();
  const [selectedPauta, setSelectedPauta] = useState<string>(
    pautaAsignada?.id || ""
  );
  const [fechaProgramada, setFechaProgramada] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);
  const [showPlanificar, setShowPlanificar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPautas = pautas.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar si el equipo está de baja
  const isDeBaja = equipoEstado === "DE_BAJA";

  // Asignar pauta al equipo (sin crear mantención)
  const handleAsignarPauta = async (pautaId: string | null) => {
    try {
      setSaving(true);
      await asignarPautaAEquipo(equipoId, pautaId);
      toast.success(
        pautaId ? "Pauta asignada correctamente" : "Pauta desasignada"
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al asignar pauta");
    } finally {
      setSaving(false);
    }
  };

  // Planificar mantención con la pauta asignada
  const handlePlanificarMantencion = async () => {
    if (!pautaAsignada) {
      toast.error("Primero debe asignar una pauta al equipo");
      return;
    }

    try {
      setSaving(true);
      await createMantencion({
        equipoId,
        pautaId: pautaAsignada.id,
        fecha: new Date(fechaProgramada),
        estadoMantencion: EstadoMantencion.PENDIENTE,
        tipoMantencion: TipoMantencion.PREVENTIVO,
      });
      toast.success("Mantención planificada correctamente");
      setShowPlanificar(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al planificar la mantención");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Bloqueo cuando está DE_BAJA */}
      {isDeBaja && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-900">Equipo dado de baja</p>
              <p className="text-sm text-red-700">
                No se pueden asignar pautas ni planificar mantenciones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pauta Asignada al Equipo */}
      <div
        className={`bg-white rounded-3xl shadow-sm border overflow-hidden ${
          isDeBaja ? "border-red-200 opacity-60" : "border-slate-200"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pauta Asignada
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {pautaAsignada ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    {pautaAsignada.nombre}
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {pautaAsignada.codigo}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full shrink-0 ${
                    PERIODICIDAD_COLORS[pautaAsignada.periodicidadBase] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {PERIODICIDAD_LABELS[pautaAsignada.periodicidadBase] ||
                    pautaAsignada.periodicidadBase}
                </span>
              </div>
              <button
                onClick={() => handleAsignarPauta(null)}
                disabled={saving || isDeBaja}
                className="mt-3 text-xs text-red-600 hover:text-red-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quitar pauta asignada
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-2 italic">
              Sin pauta asignada
            </p>
          )}

          {/* Selector para asignar nueva pauta */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              {pautaAsignada ? "Cambiar pauta" : "Seleccionar pauta"}
            </label>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar pauta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isDeBaja}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all ${
                    isDeBaja
                      ? "border-red-300 bg-red-50 cursor-not-allowed"
                      : "border-slate-300 bg-white"
                  }`}
                />
                <svg
                  className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <select
                value={selectedPauta}
                onChange={(e) => setSelectedPauta(e.target.value)}
                disabled={isDeBaja}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all appearance-none bg-no-repeat bg-[position:right_1rem_center] ${
                  isDeBaja
                    ? "border-red-300 bg-red-50 cursor-not-allowed"
                    : "border-slate-300 bg-white"
                }`}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundSize: "1.5rem 1.5rem",
                }}
              >
                <option value="">-- Seleccionar Pauta --</option>
                {filteredPautas.map((pauta) => (
                  <option key={pauta.id} value={pauta.id}>
                    {pauta.codigo} - {pauta.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAsignarPauta(selectedPauta || null)}
                disabled={
                  saving ||
                  !selectedPauta ||
                  selectedPauta === pautaAsignada?.id ||
                  isDeBaja
                }
                className="w-full px-4 py-3 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    ></svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>Asignar Pauta</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Planificar Mantención - Solo si no está DE_BAJA */}
      {pautaAsignada && !isDeBaja && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Planificar Mantención
            </h3>
          </div>
          <div className="p-6">
            {!showPlanificar ? (
              <button
                onClick={() => setShowPlanificar(true)}
                className="w-full px-4 py-4 border-2 border-dashed border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 rounded-2xl font-bold"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Planificar con {pautaAsignada.codigo}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-600">
                    Se creará una mantención con:
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {pautaAsignada.nombre}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                    Fecha Programada
                  </label>
                  <input
                    type="date"
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPlanificar(false)}
                    className="flex-1 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:bg-slate-50 rounded-full font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePlanificarMantencion}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-md shadow-emerald-600/10"
                  >
                    {saving ? "Guardando..." : "Planificar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mantenciones Pendientes */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Mantenciones Pendientes
          </h3>
        </div>
        <div className="p-4">
          {mantencionesPendientes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 italic">
              No hay mantenciones pendientes
            </p>
          ) : (
            <div className="space-y-3">
              {mantencionesPendientes.map((mant) => (
                <div
                  key={mant.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {mant.pauta?.nombre || "Sin pauta"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(mant.fecha)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      mant.estadoMantencion === "PENDIENTE"
                        ? "bg-amber-100 text-amber-700"
                        : mant.estadoMantencion === "EN_PROCESO"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {mant.estadoMantencion === "PENDIENTE"
                      ? "Pendiente"
                      : mant.estadoMantencion === "EN_PROCESO"
                      ? "En Proceso"
                      : mant.estadoMantencion}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Pautas Disponibles */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">
            Pautas Disponibles ({filteredPautas.length})
          </h3>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredPautas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6 italic">
              No se encontraron pautas.
            </p>
          ) : (
            filteredPautas.map((pauta) => (
              <div
                key={pauta.id}
                className={`px-6 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors ${
                  pauta.id === pautaAsignada?.id ? "bg-blue-50/50" : ""
                }`}
                onClick={() => setSelectedPauta(pauta.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {pauta.id === pautaAsignada?.id && (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {pauta.nombre}
                      </p>
                      <p className="text-xs text-slate-500">{pauta.codigo}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      PERIODICIDAD_COLORS[pauta.periodicidadBase] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {PERIODICIDAD_LABELS[pauta.periodicidadBase] ||
                      pauta.periodicidadBase}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
