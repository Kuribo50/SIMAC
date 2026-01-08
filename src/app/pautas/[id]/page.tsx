import Link from "next/link";
import { getPauta } from "../../actions";
import { notFound } from "next/navigation";
import PautaActions from "./PautaActions";
import { getCurrentUser } from "@/lib/auth";
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Wrench,
  Building2,
  Settings,
  ListTodo,
  Clock,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckSquare,
  Square,
  TrendingUp,
  Target,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

// Configuración de tipos de pauta con gradientes
const TIPO_PAUTA_CONFIG: Record<
  string,
  {
    short: string;
    full: string;
    gradient: string;
    bgLight: string;
    textColor: string;
    icon: string;
    borderColor: string;
  }
> = {
  RECURSO_HUMANO: {
    short: "RH",
    full: "Recurso Humano",
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50 dark:bg-violet-900/20",
    textColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-200 dark:border-violet-800",
    icon: "👥",
  },
  INFRAESTRUCTURA: {
    short: "INS",
    full: "Infraestructura",
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50 dark:bg-cyan-900/20",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    icon: "🏢",
  },
  EQUIPAMIENTO: {
    short: "EQ",
    full: "Equipamiento",
    gradient: "from-orange-500 to-amber-600",
    bgLight: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: "🔧",
  },
};

const getPeriodicidadConfig = (periodicidad: string) => {
  switch (periodicidad) {
    case "MENSUAL":
      return { bg: "bg-purple-100", text: "text-purple-700", label: "Mensual" };
    case "BIMESTRAL":
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-700",
        label: "Bimestral",
      };
    case "TRIMESTRAL":
      return { bg: "bg-blue-100", text: "text-blue-700", label: "Trimestral" };
    case "SEMESTRAL":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Semestral",
      };
    case "ANUAL":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "Anual" };
    default:
      return { bg: "bg-zinc-100", text: "text-zinc-600", label: periodicidad };
  }
};

const getEstadoMantencionConfig = (estado: string) => {
  switch (estado) {
    case "COMPLETADA":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Completada",
      };
    case "PENDIENTE":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "Pendiente" };
    case "EN_PROCESO":
      return { bg: "bg-blue-100", text: "text-blue-700", label: "En Proceso" };
    case "CANCELADA":
      return { bg: "bg-red-100", text: "text-red-700", label: "Cancelada" };
    case "PROGRAMADA":
      return {
        bg: "bg-purple-100",
        text: "text-purple-700",
        label: "Programada",
      };
    default:
      return { bg: "bg-zinc-100", text: "text-zinc-600", label: estado };
  }
};

export default async function PautaDetailPage({ params }: Props) {
  const { id } = await params;
  const [pauta, user] = await Promise.all([getPauta(id), getCurrentUser()]);
  const userRole = user?.rol || "VISUALIZADOR";

  if (!pauta) {
    notFound();
  }

  const periodicidadConfig = getPeriodicidadConfig(pauta.periodicidadBase);
  const tipoPautaConfig = TIPO_PAUTA_CONFIG[pauta.tipo || "EQUIPAMIENTO"];

  // Agrupar mantenciones por equipo para contar equipos únicos
  const equiposUnicos = new Set(pauta.mantenciones.map((m) => m.equipo.id))
    .size;
  const completadas = pauta.mantenciones.filter(
    (m) => m.estadoMantencion === "COMPLETADA"
  ).length;
  const porcentajeCompletadas =
    pauta.mantenciones.length > 0
      ? Math.round((completadas / pauta.mantenciones.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Hero con gradiente */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${tipoPautaConfig.gradient} p-6 md:p-8 shadow-xl`}
        >
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24"></div>

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                href="/pautas"
                className="p-2.5 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {/* Badge del tipo */}
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    <span className="text-lg">{tipoPautaConfig.icon}</span>
                    {tipoPautaConfig.short}
                  </span>
                  <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-900 shadow-lg">
                    {pauta.codigo}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {periodicidadConfig.label}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      pauta.activo
                        ? "bg-emerald-400/30 text-white border border-emerald-300/50"
                        : "bg-white/10 text-white/70 border border-white/20"
                    }`}
                  >
                    {pauta.activo ? "✓ Activa" : "○ Inactiva"}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {pauta.nombre}
                </h1>
                {pauta.descripcion && (
                  <p className="text-white/80 mt-1 max-w-2xl">
                    {pauta.descripcion}
                  </p>
                )}
                <p className="text-sm text-white/60 mt-3">
                  Categoría:{" "}
                  <span className="font-semibold text-white/90">
                    {tipoPautaConfig.full}
                  </span>
                </p>
              </div>
            </div>
            <div className="md:ml-auto">
              <PautaActions
                pautaId={pauta.id}
                pautaNombre={pauta.nombre}
                activo={pauta.activo}
                mantencionesCont={pauta.mantenciones.length}
                userRole={userRole}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards con diseño mejorado */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Items */}
          <div className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/25">
                <ListTodo className="w-5 h-5" />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {pauta.items?.length || 0}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Items en Checklist
            </p>
          </div>

          {/* Mantenciones */}
          <div className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {pauta.mantenciones.length}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Mantenciones
            </p>
          </div>

          {/* Equipos */}
          <div className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg shadow-emerald-500/25">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {equiposUnicos}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Equipos Asignados
            </p>
          </div>

          {/* Completadas con barra de progreso */}
          <div className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg shadow-amber-500/25">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {porcentajeCompletadas}%
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Completadas ({completadas}/{pauta.mantenciones.length})
            </p>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${porcentajeCompletadas}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Grid de dos columnas: Info + Checklist */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Info Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Detalles de la pauta */}
            <div
              className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border ${tipoPautaConfig.borderColor} overflow-hidden`}
            >
              <div
                className={`p-4 ${tipoPautaConfig.bgLight} border-b ${tipoPautaConfig.borderColor}`}
              >
                <h3
                  className={`font-bold ${tipoPautaConfig.textColor} flex items-center gap-2`}
                >
                  <FileText className="w-4 h-4" />
                  Detalles de la Pauta
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {pauta.areaAdministrativa && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                        Área Administrativa
                      </p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {pauta.areaAdministrativa}
                      </p>
                    </div>
                  </div>
                )}

                {pauta.tipoEquipo && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                      <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                        Tipo de Equipo
                      </p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {pauta.tipoEquipo.subcategoria}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg shrink-0">
                    <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                      Tipo Mantención
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                      {pauta.tipoMantencion === "PREVENTIVO"
                        ? "Preventiva"
                        : "Correctiva"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info adicional si no hay área ni tipo equipo */}
            {!pauta.areaAdministrativa && !pauta.tipoEquipo && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                      Información incompleta
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Esta pauta no tiene área administrativa ni tipo de equipo
                      asignado.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Checklist */}
          <div className="lg:col-span-2">
            {pauta.items && pauta.items.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div
                  className={`p-5 bg-gradient-to-r ${tipoPautaConfig.gradient}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Checklist de Actividades
                      </h2>
                      <p className="text-sm text-white/70 mt-1">
                        {pauta.items.length} actividades definidas para esta
                        pauta
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                        <CheckSquare className="w-3 h-3 inline mr-1" />
                        {pauta.items.filter((i) => i.isRequired).length}{" "}
                        obligatorios
                      </span>
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                        <Square className="w-3 h-3 inline mr-1" />
                        {pauta.items.filter((i) => !i.isRequired).length}{" "}
                        opcionales
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="space-y-2">
                    {pauta.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                          item.isRequired
                            ? "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-l-emerald-500"
                            : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-l-slate-300 dark:border-l-slate-700"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                            item.isRequired
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {item.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium ${
                              item.isRequired
                                ? "text-slate-900 dark:text-slate-100"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                            item.isRequired
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500"
                          }`}
                        >
                          {item.isRequired ? "✓ Obligatorio" : "○ Opcional"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Sin checklist
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Esta pauta no tiene actividades definidas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de mantenciones */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historial de Mantenciones
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {pauta.mantenciones.length} mantenciones registradas con esta
                  pauta
                </p>
              </div>
              {pauta.mantenciones.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>{completadas} completadas</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {pauta.mantenciones.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto mb-4">
                <ClipboardList className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Sin mantenciones
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Aún no se han registrado mantenciones con esta pauta.
              </p>
            </div>
          ) : (
            <div className="p-3">
              <div className="space-y-2">
                {pauta.mantenciones.map((mant) => {
                  const estadoConfig = getEstadoMantencionConfig(
                    mant.estadoMantencion
                  );
                  return (
                    <Link
                      key={mant.id}
                      href={`/mantenciones/${mant.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl transition-colors ${
                            mant.estadoMantencion === "COMPLETADA"
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : mant.estadoMantencion === "PENDIENTE"
                              ? "bg-amber-100 dark:bg-amber-900/30"
                              : "bg-blue-100 dark:bg-blue-900/30"
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              mant.estadoMantencion === "COMPLETADA"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : mant.estadoMantencion === "PENDIENTE"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {mant.equipo.nombre}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {mant.equipo.ubicacion?.establecimiento}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">
                              •
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(mant.fecha).toLocaleDateString(
                                "es-CL",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${estadoConfig.bg} ${estadoConfig.text} dark:bg-opacity-30`}
                        >
                          {estadoConfig.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
