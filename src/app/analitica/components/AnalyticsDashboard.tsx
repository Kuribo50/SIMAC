"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getPautasAnalytics,
  getEstablecimientosAnalytics,
  getAreasAnalytics,
  getEquiposAnalytics,
  getGlobalStats,
  AnalyticsItem,
  EquipmentItem,
  GlobalStats,
} from "../../actions/analytics";
import {
  ChevronRight,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  LayoutDashboard,
  Building2,
  MapPin,
  ClipboardList,
  PieChart as PieChartIcon,
  Users,
  Wrench,
  TrendingUp,
  Clock,
  Target,
  Percent,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type DrillLevel = "PAUTA" | "ESTABLECIMIENTO" | "AREA" | "EQUIPO";

const COLORS_STATUS = ["#10b981", "#ef4444"]; // Emerald-500, Red-500
const COLORS_PLANNING = ["#3b82f6", "#f59e0b"]; // Blue-500, Amber-500
const COLORS_TIPO = ["#8b5cf6", "#06b6d4", "#f97316"]; // Purple, Cyan, Orange
const COLORS_MANTENCION = ["#10b981", "#3b82f6"]; // Emerald, Blue

// Etiquetas cortas para tipos de pauta
const TIPO_LABELS: Record<
  string,
  { short: string; full: string; color: string }
> = {
  RECURSO_HUMANO: {
    short: "RH",
    full: "Recurso Humano",
    color: "bg-violet-500",
  },
  INFRAESTRUCTURA: {
    short: "INS",
    full: "Infraestructura",
    color: "bg-cyan-500",
  },
  EQUIPAMIENTO: { short: "EQ", full: "Equipamiento", color: "bg-orange-500" },
};

export default function AnalyticsDashboard() {
  const [level, setLevel] = useState<DrillLevel>("PAUTA");
  const [history, setHistory] = useState<
    { level: DrillLevel; id: string; name: string }[]
  >([]);

  // Selection State
  const [selectedPauta, setSelectedPauta] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<
    string | null
  >(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Data State
  const [data, setData] = useState<AnalyticsItem[]>([]);
  const [equiposData, setEquiposData] = useState<EquipmentItem[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [level, selectedPauta, selectedEstablecimiento, selectedArea]);

  useEffect(() => {
    // Fetch global stats on mount
    const fetchGlobalStats = async () => {
      const stats = await getGlobalStats();
      setGlobalStats(stats);
    };
    fetchGlobalStats();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (level === "PAUTA") {
        const res = await getPautasAnalytics();
        setData(res);
      } else if (level === "ESTABLECIMIENTO" && selectedPauta) {
        const res = await getEstablecimientosAnalytics(selectedPauta.id);
        setData(res);
      } else if (level === "AREA" && selectedPauta && selectedEstablecimiento) {
        const res = await getAreasAnalytics(
          selectedPauta.id,
          selectedEstablecimiento
        );
        setData(res);
      } else if (
        level === "EQUIPO" &&
        selectedPauta &&
        selectedEstablecimiento &&
        selectedArea
      ) {
        const res = await getEquiposAnalytics(
          selectedPauta.id,
          selectedEstablecimiento,
          selectedArea
        );
        setEquiposData(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculated Stats for Charts
  const stats = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.total, 0);
    const ok = data.reduce((acc, item) => acc + item.ok, 0);
    const notOk = total - ok;
    const planned = data.reduce((acc, item) => acc + item.planned, 0);
    const unassigned = total - planned;

    return {
      total,
      ok,
      notOk,
      planned,
      unassigned,
    };
  }, [data]);

  const statusData = [
    { name: "Operativo", value: stats.ok },
    { name: "No Operativo", value: stats.notOk },
  ];

  const planningData = [
    { name: "Planificado", value: stats.planned },
    { name: "Por Asignar", value: stats.unassigned },
  ];

  const traverseTo = (newLevel: DrillLevel, id?: string, name?: string) => {
    if (newLevel === "ESTABLECIMIENTO" && id && name) {
      setSelectedPauta({ id, name });
      setHistory([{ level: "PAUTA", id: "root", name: "Pautas" }]);
    } else if (newLevel === "AREA" && id) {
      setSelectedEstablecimiento(id); // ID is name here
      setHistory((prev) => [
        ...prev,
        { level: "ESTABLECIMIENTO", id, name: id },
      ]);
    } else if (newLevel === "EQUIPO" && id) {
      setSelectedArea(id);
      setHistory((prev) => [...prev, { level: "AREA", id, name: id }]);
    }
    setLevel(newLevel);
  };

  const handleBack = () => {
    if (level === "ESTABLECIMIENTO") {
      setLevel("PAUTA");
      setSelectedPauta(null);
      setHistory([]);
    } else if (level === "AREA") {
      setLevel("ESTABLECIMIENTO");
      setSelectedEstablecimiento(null);
      setHistory((prev) => prev.slice(0, 1));
    } else if (level === "EQUIPO") {
      setLevel("AREA");
      setSelectedArea(null);
      setHistory((prev) => prev.slice(0, 2));
    }
  };

  const getBreadcrumbs = () => {
    // Solo mostrar breadcrumbs cuando no estamos en nivel PAUTA
    if (level === "PAUTA") return null;

    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap font-medium bg-white dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => {
            setLevel("PAUTA");
            setSelectedPauta(null);
            setHistory([]);
          }}
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ClipboardList className="w-4 h-4" />
          Pautas
        </button>

        {selectedPauta && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => {
                setLevel("ESTABLECIMIENTO");
                setSelectedEstablecimiento(null);
                setSelectedArea(null);
              }}
              className={`hover:text-blue-600 transition-colors ${
                level === "ESTABLECIMIENTO" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              {selectedPauta.name}
            </button>
          </>
        )}

        {selectedEstablecimiento && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => {
                setLevel("AREA");
                setSelectedArea(null);
              }}
              className={`hover:text-blue-600 transition-colors ${
                level === "AREA" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              {selectedEstablecimiento}
            </button>
          </>
        )}

        {selectedArea && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-blue-600 font-semibold">{selectedArea}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BarChart3 className="w-7 h-7" />
              Panel de Analítica
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Visión general y estado de la infraestructura
            </p>
          </div>
        </div>

        {/* Global Stats Cards - Solo en nivel PAUTA */}
        {level === "PAUTA" && globalStats && (
          <div className="mb-8 space-y-6">
            {/* Primera fila: KPIs principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Porcentaje de Cumplimiento */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 relative">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      Cumplimiento
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {globalStats.porcentajeCumplimiento}%
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${globalStats.porcentajeCumplimiento}%` }}
                  />
                </div>
              </div>

              {/* Equipos Operativos */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 relative">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      Operativos
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {globalStats.porcentajeOperativos}%
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {globalStats.equiposOperativos} de {globalStats.totalEquipos}{" "}
                  equipos
                </p>
              </div>

              {/* Mantenciones Vencidas */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 relative">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      Vencidas
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {globalStats.mantencionesVencidas}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Mantenciones atrasadas
                </p>
              </div>

              {/* Por Vencer */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-20 h-20 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 relative">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      Por Vencer
                    </p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {globalStats.mantencionesPorVencer}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Próximos 7 días</p>
              </div>
            </div>

            {/* Segunda fila: Distribución por Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recurso Humano */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-violet-500 text-white flex items-center justify-center text-xs font-bold">
                      RH
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Recurso Humano
                    </span>
                  </div>
                  <Users className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {globalStats.equiposRH}
                </p>
                <p className="text-xs text-slate-500 mt-1">equipos asignados</p>
              </div>

              {/* Infraestructura */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                      INS
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Infraestructura
                    </span>
                  </div>
                  <Building2 className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {globalStats.equiposINS}
                </p>
                <p className="text-xs text-slate-500 mt-1">equipos asignados</p>
              </div>

              {/* Equipamiento */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                      EQ
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Equipamiento
                    </span>
                  </div>
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {globalStats.equiposEQ}
                </p>
                <p className="text-xs text-slate-500 mt-1">equipos asignados</p>
              </div>
            </div>

            {/* Título de sección pautas - AHORA ANTES DE LOS GRÁFICOS */}
            <div className="pt-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                Pautas por Categoría
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Haz clic en una pauta para ver el detalle por establecimiento
              </p>
            </div>
          </div>
        )}

        {getBreadcrumbs()}

        {level !== "PAUTA" && (
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Charts Section (Only on Summary Views) */}
            {level !== "EQUIPO" && level !== "PAUTA" && data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-emerald-500" />
                    Estado General de Equipos
                  </h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS_STATUS[index % COLORS_STATUS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-500" />
                    Estado de Planificación
                  </h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planningData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {planningData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                COLORS_PLANNING[index % COLORS_PLANNING.length]
                              }
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* List/Table View */}
            {level === "EQUIPO" ? (
              // Equipment Detail Table
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h2 className="font-semibold text-slate-700 dark:text-slate-200">
                    Equipos en {selectedArea}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-3 font-medium">Equipo</th>
                        <th className="px-6 py-3 font-medium">Estado</th>
                        <th className="px-6 py-3 font-medium">Mantención</th>
                        <th className="px-6 py-3 font-medium">Próxima Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {equiposData.map((eq) => (
                        <tr
                          key={eq.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {eq.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {eq.serie || "S/N"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                eq.estado === "OPERATIVO"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                              }`}
                            >
                              {eq.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {eq.estadoMantencion ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  eq.estadoMantencion === "PENDIENTE"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                    : eq.estadoMantencion === "EN_PROCESO"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {eq.estadoMantencion === "PENDIENTE" && (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                {eq.estadoMantencion === "EN_PROCESO" && (
                                  <Calendar className="w-3 h-3" />
                                )}
                                {eq.estadoMantencion.replace("_", " ")}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">
                                Sin asignar
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {eq.proximaMantencion
                              ? format(
                                  parseISO(eq.proximaMantencion),
                                  "dd MMM yyyy",
                                  { locale: es }
                                )
                              : "-"}
                          </td>
                        </tr>
                      ))}
                      {equiposData.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            No se encontraron equipos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Enhanced List Table for Pautas/Establishments/Areas
              <div className="space-y-6">
                {level === "PAUTA" ? (
                  // Grouped Pauta View
                  <>
                    {(
                      [
                        "RECURSO_HUMANO",
                        "INFRAESTRUCTURA",
                        "EQUIPAMIENTO",
                      ] as const
                    ).map((category) => {
                      const categoryItems = data.filter(
                        (item) => item.tipoPauta === category
                      );
                      if (categoryItems.length === 0) return null;

                      return (
                        <div
                          key={category}
                          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              {category === "RECURSO_HUMANO" && (
                                <ClipboardList className="w-5 h-5 text-blue-500" />
                              )}
                              {category === "INFRAESTRUCTURA" && (
                                <Building2 className="w-5 h-5 text-indigo-500" />
                              )}
                              {category === "EQUIPAMIENTO" && (
                                <PieChartIcon className="w-5 h-5 text-emerald-500" />
                              )}
                              {category.replace("_", " ")}
                            </h2>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <tr>
                                  <th className="px-6 py-3 font-medium w-1/3">
                                    Nombre
                                  </th>
                                  <th className="px-6 py-3 font-medium text-center">
                                    Total Equipos
                                  </th>
                                  <th className="px-6 py-3 font-medium w-1/4">
                                    Estado (Op. vs No Ok)
                                  </th>
                                  <th className="px-6 py-3 font-medium w-1/4">
                                    Planificación (Plan. vs Pend.)
                                  </th>
                                  <th className="px-6 py-3 font-medium w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {categoryItems.map((item) => (
                                  <tr
                                    key={item.id}
                                    onClick={() =>
                                      traverseTo(
                                        "ESTABLECIMIENTO",
                                        item.id,
                                        item.name
                                      )
                                    }
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        {item.color && (
                                          <div
                                            className="w-1 h-8 rounded-full"
                                            style={{
                                              backgroundColor: item.color,
                                            }}
                                          />
                                        )}
                                        <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                          {item.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                                      {item.total}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
                                        <span>{item.ok} OK</span>
                                        <span>
                                          {item.total > 0
                                            ? Math.round(
                                                (item.ok / item.total) * 100
                                              )
                                            : 0}
                                          %
                                        </span>
                                      </div>
                                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div
                                          className="h-full bg-emerald-500"
                                          style={{
                                            width: `${
                                              item.total > 0
                                                ? (item.ok / item.total) * 100
                                                : 0
                                            }%`,
                                          }}
                                        />
                                        <div
                                          className="h-full bg-red-500"
                                          style={{
                                            width: `${
                                              item.total > 0
                                                ? (item.notOk / item.total) *
                                                  100
                                                : 0
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
                                        <span>{item.planned} Plan.</span>
                                        <span>
                                          {item.total > 0
                                            ? Math.round(
                                                (item.planned / item.total) *
                                                  100
                                              )
                                            : 0}
                                          %
                                        </span>
                                      </div>
                                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div
                                          className="h-full bg-blue-500"
                                          style={{
                                            width: `${
                                              item.total > 0
                                                ? (item.planned / item.total) *
                                                  100
                                                : 0
                                            }%`,
                                          }}
                                        />
                                        <div
                                          className="h-full bg-amber-500"
                                          style={{
                                            width: `${
                                              item.total > 0
                                                ? (item.unassigned /
                                                    item.total) *
                                                  100
                                                : 0
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                    {data.length === 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
                        No se encontraron pautas actives.
                      </div>
                    )}

                    {/* Gráficos de resumen - Disposición Vertical después de las pautas */}
                    {globalStats && data.length > 0 && (
                      <div className="mt-8 space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Resumen Gráfico
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Gráfico de Tipo de Mantención */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wide">
                              <Wrench className="w-4 h-4 text-blue-500" />
                              Tipo de Mantención
                            </h3>
                            <div className="h-[180px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      {
                                        name: "Preventivas",
                                        value:
                                          globalStats.mantencionesPreventivas,
                                      },
                                      {
                                        name: "Correctivas",
                                        value:
                                          globalStats.mantencionesCorrectivas,
                                      },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#3b82f6" />
                                  </Pie>
                                  <RechartsTooltip
                                    contentStyle={{
                                      borderRadius: "8px",
                                      border: "none",
                                      boxShadow:
                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                  />
                                  <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Gráfico de Estado de Mantenciones */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wide">
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                              Estado Mantenciones
                            </h3>
                            <div className="h-[180px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      {
                                        name: "Completadas",
                                        value:
                                          globalStats.mantencionesCompletadas,
                                      },
                                      {
                                        name: "Pendientes",
                                        value:
                                          globalStats.mantencionesPendientes,
                                      },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f59e0b" />
                                  </Pie>
                                  <RechartsTooltip
                                    contentStyle={{
                                      borderRadius: "8px",
                                      border: "none",
                                      boxShadow:
                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                  />
                                  <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Gráfico de Equipos por Categoría */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wide">
                              <PieChartIcon className="w-4 h-4 text-violet-500" />
                              Equipos por Categoría
                            </h3>
                            <div className="h-[180px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      {
                                        name: "RH",
                                        value: globalStats.equiposRH,
                                      },
                                      {
                                        name: "INS",
                                        value: globalStats.equiposINS,
                                      },
                                      {
                                        name: "EQ",
                                        value: globalStats.equiposEQ,
                                      },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#06b6d4" />
                                    <Cell fill="#f97316" />
                                  </Pie>
                                  <RechartsTooltip
                                    contentStyle={{
                                      borderRadius: "8px",
                                      border: "none",
                                      boxShadow:
                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                  />
                                  <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Normal View for Establishment / Area
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <h2 className="font-semibold text-slate-700 dark:text-slate-200">
                        {level === "ESTABLECIMIENTO"
                          ? `Establecimientos en ${selectedPauta?.name}`
                          : `Áreas en ${selectedEstablecimiento}`}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="px-6 py-3 font-medium w-1/3">
                              Nombre
                            </th>
                            <th className="px-6 py-3 font-medium text-center">
                              Total Equipos
                            </th>
                            <th className="px-6 py-3 font-medium w-1/4">
                              Estado (Op. vs No Ok)
                            </th>
                            <th className="px-6 py-3 font-medium w-1/4">
                              Planificación (Plan. vs Pend.)
                            </th>
                            <th className="px-6 py-3 font-medium w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.map((item) => (
                            <tr
                              key={item.id}
                              onClick={() =>
                                traverseTo(
                                  level === "ESTABLECIMIENTO"
                                    ? "AREA"
                                    : "EQUIPO",
                                  item.id,
                                  item.name
                                )
                              }
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {item.color && (
                                    <div
                                      className="w-1 h-8 rounded-full"
                                      style={{
                                        backgroundColor: item.color,
                                      }}
                                    />
                                  )}
                                  <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                                {item.total}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
                                  <span>{item.ok} OK</span>
                                  <span>
                                    {item.total > 0
                                      ? Math.round((item.ok / item.total) * 100)
                                      : 0}
                                    %
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-emerald-500"
                                    style={{
                                      width: `${
                                        item.total > 0
                                          ? (item.ok / item.total) * 100
                                          : 0
                                      }%`,
                                    }}
                                  />
                                  <div
                                    className="h-full bg-red-500"
                                    style={{
                                      width: `${
                                        item.total > 0
                                          ? (item.notOk / item.total) * 100
                                          : 0
                                      }%`,
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
                                  <span>{item.planned} Plan.</span>
                                  <span>
                                    {item.total > 0
                                      ? Math.round(
                                          (item.planned / item.total) * 100
                                        )
                                      : 0}
                                    %
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${
                                        item.total > 0
                                          ? (item.planned / item.total) * 100
                                          : 0
                                      }%`,
                                    }}
                                  />
                                  <div
                                    className="h-full bg-amber-500"
                                    style={{
                                      width: `${
                                        item.total > 0
                                          ? (item.unassigned / item.total) * 100
                                          : 0
                                      }%`,
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                              </td>
                            </tr>
                          ))}
                          {data.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-6 py-8 text-center text-slate-500"
                              >
                                No se encontraron datos.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
