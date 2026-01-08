import Link from "next/link";
import { getPautas } from "../actions";
import PautasList from "./components/PautasList";
import { getCurrentUser } from "@/lib/auth";
import {
  Plus,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
} from "lucide-react";

export default async function PautasPage() {
  const [pautas, user] = await Promise.all([getPautas(), getCurrentUser()]);
  const userRole = user?.rol || "VISUALIZADOR";
  const canCreate = userRole === "ADMINISTRADOR" || userRole === "REGISTRADOR";

  const periodicidadColors: Record<string, string> = {
    MENSUAL:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/10 dark:ring-purple-500/30",
    BIMESTRAL:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/10 dark:ring-indigo-500/30",
    TRIMESTRAL:
      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/10 dark:ring-blue-500/30",
    SEMESTRAL:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/10 dark:ring-emerald-500/30",
    ANUAL:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500/10 dark:ring-orange-500/30",
    NO_APLICA:
      "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-500/10 dark:ring-slate-500/30",
  };

  const periodicidadLabels: Record<string, string> = {
    MENSUAL: "Mensual",
    BIMESTRAL: "Bimestral",
    TRIMESTRAL: "Trimestral",
    SEMESTRAL: "Semestral",
    ANUAL: "Anual",
    NO_APLICA: "Sin periodicidad",
  };

  const activas = pautas.filter((p) => p.activo);
  const inactivas = pautas.filter((p) => !p.activo);

  return (
    <div className="p-6 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            Pautas de Mantención
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 ml-11">
            Gestión de protocolos y checklists para equipos
          </p>
        </div>

        {canCreate && (
          <Link
            href="/pautas/nueva"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-full hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md font-bold text-sm"
          >
            <Plus className="w-5 h-5" />
            Nueva Pauta
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                Total Pautas
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {pautas.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                Activas
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activas.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                Items Checklist
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {pautas.reduce((sum, p) => sum + (p._count?.items || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                Mantenciones
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {pautas.reduce(
                  (sum, p) => sum + (p._count?.mantenciones || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pautas.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No hay pautas creadas
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 font-medium max-w-sm mx-auto">
            Comienza creando una nueva pauta de mantención para establecer los
            protocolos de servicio.
          </p>
          {canCreate && (
            <Link
              href="/pautas/nueva"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-full hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors font-bold shadow-lg shadow-slate-200 dark:shadow-none"
            >
              <Plus className="w-5 h-5" />
              Crear Primera Pauta
            </Link>
          )}
        </div>
      ) : (
        <PautasList
          pautas={pautas}
          periodicidadColors={periodicidadColors}
          periodicidadLabels={periodicidadLabels}
          userRole={userRole}
        />
      )}
    </div>
  );
}
