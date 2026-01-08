import { Suspense } from "react";
import Link from "next/link";
import { getDashboardStats, getCentros } from "./actions/dashboard";
import { getCurrentUser } from "@/lib/auth";
import { MaintenanceChart } from "./components/dashboard/DashboardCharts/DashboardCharts";
import { DashboardFilter } from "./components/dashboard/DashboardFilter";

import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  LayoutGrid,
  Monitor,
  MoreHorizontal,
  Plus,
  Search,
  Timer,
  TrendingUp,
  Wrench,
  FileText,
  BarChart3,
  Archive,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
  subtext,
  link,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "indigo" | "rose";
  subtext?: string;
  link?: string;
}) {
  const colorStyles = {
    blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
    green:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
    amber:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
    indigo:
      "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10",
    rose: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10",
  };

  const Content = (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div
          className={`p-3 rounded-xl ${colorStyles[color]} transition-colors`}
        >
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>+{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
          {title}
        </h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {subtext}
          </p>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div
        className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-10 transition-opacity bg-current ${
          colorStyles[color].split(" ")[0]
        }`}
      />
    </div>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="block transition-transform hover:-translate-y-0.5"
      >
        {Content}
      </Link>
    );
  }

  return Content;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const centro =
    typeof resolvedSearchParams.centro === "string"
      ? resolvedSearchParams.centro
      : undefined;

  const [stats, centros, user] = await Promise.all([
    getDashboardStats(centro),
    getCentros(),
    getCurrentUser(),
  ]);

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hola, {firstName} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Resumen operativo{" "}
            {centro ? (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                · {centro}
              </span>
            ) : (
              "general"
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardFilter centros={centros} />
          {/* Aquí podría ir un botón de reporte global p.ej */}
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Equipos"
          value={stats.totalEquipos}
          icon={<Monitor className="w-6 h-6" />}
          link={`/equipos${
            centro ? `?ubicacion=${encodeURIComponent(centro)}` : ""
          }`}
          subtext="Equipos registrados"
        />
        <StatCard
          title="Equipos Operativos"
          value={stats.equiposOperativos}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
          link={`/equipos${
            centro ? `?ubicacion=${encodeURIComponent(centro)}` : ""
          }`}
          subtext={`${(
            (stats.equiposOperativos / (stats.totalEquipos || 1)) *
            100
          ).toFixed(0)}% del total`}
        />
        <StatCard
          title="Mant. este Mes"
          value={stats.mantencionesThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="amber"
          link="/planificacion"
          subtext="Programadas"
        />
        <StatCard
          title="Eficiencia Global"
          value={`${stats.eficienciaGlobal}%`}
          icon={<Activity className="w-6 h-6" />}
          color="indigo"
          subtext="Tasa de cumplimiento"
          link="/analitica"
        />
      </div>

      {/* Main Content Grid: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm border border-stone-100 dark:border-slate-800">
            <MaintenanceChart data={stats.activityByDay} />
          </div>

          {/* Recent Maintenance Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Mantenciones Recientes
              </h3>
              <Link
                href="/mantenciones/historial"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Ver todas
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-3">Equipo</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                  {stats.recentMaintenances.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                        {m.equipo.nombre}
                        <br />
                        <span className="text-xs text-slate-400 font-normal">
                          {m.equipo.serie || "S/N"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {m.tipoMantencion}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            m.estadoMantencion === "COMPLETADA"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : m.estadoMantencion === "PENDIENTE"
                              ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          }`}
                        >
                          {m.estadoMantencion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {new Date(m.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/mantenciones/${m.id}/visualizar`}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {stats.recentMaintenances.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        No hay mantenciones recientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Vencidas Widget */}
          {stats.mantencionesVencidas > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-5 rounded-2xl flex items-center justify-between shadow-sm animate-pulse-slow">
              <div>
                <p className="text-red-600 dark:text-red-400 font-semibold mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Atención Requerida
                </p>
                <p className="text-sm text-red-500 dark:text-red-300">
                  <span className="font-bold text-xl mr-1">
                    {stats.mantencionesVencidas}
                  </span>
                  mantenciones vencidas
                </p>
              </div>
              <Link
                href="/mantenciones/pendientes"
                className="px-4 py-2 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg shadow-sm hover:shadow border border-red-100 dark:border-red-900/30 transition-all"
              >
                Ver
              </Link>
            </div>
          )}

          {/* Quick Access */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide text-opacity-70">
              Accesos Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/mantenciones/nueva"
                className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/30 transition-all flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Nueva Orden
                </span>
              </Link>
              <Link
                href="/buscar-folio"
                className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-900/30 transition-all flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                  <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  Buscar Folio
                </span>
              </Link>
              <Link
                href="/equipos"
                className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                  <LayoutGrid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  Inventario
                </span>
              </Link>
              <Link
                href="/analitica"
                className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/10 border border-transparent hover:border-amber-200 dark:hover:border-amber-900/30 transition-all flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                  <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                  Reportes
                </span>
              </Link>
            </div>
          </div>

          {/* Upcoming Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Próximos 7 días
              </h3>
              {stats.upcomingMaintenances.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingMaintenances.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-amber-200 dark:hover:border-amber-900/30 transition-colors cursor-default group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <span className="text-amber-700 dark:text-amber-400 font-bold text-xs">
                          {new Date(m.fecha).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {m.equipo.nombre}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {m.tipoMantencion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm">
                    Sin pendientes próximos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
