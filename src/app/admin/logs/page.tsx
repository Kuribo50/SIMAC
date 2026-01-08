import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { fetchAuditLogs, fetchAuditStats } from "../../actions/audit";
import Link from "next/link";
import { ArrowLeft, History, Activity, Users, FileText } from "lucide-react";
import LogsTable from "./LogsTable";
import LogsFilters from "./LogsFilters";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    entity?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol !== "ADMINISTRADOR") {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const [logsResult, stats] = await Promise.all([
    fetchAuditLogs({
      page,
      action: params.action,
      entity: params.entity,
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: 25,
    }),
    fetchAuditStats(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Administración
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-600/20">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Historial de Actividad
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Monitoreo y registro detallado de todas las operaciones del
                sistema
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {stats.totalToday}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Acciones hoy
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {logsResult.total}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Total registros
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {stats.recentUsers.length}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Usuarios activos
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Top acciones (7 días)
              </p>
              <div className="space-y-2">
                {stats.byAction.slice(0, 3).map((a) => (
                  <div
                    key={a.action}
                    className="flex items-center justify-between text-xs group"
                  >
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      {a.action}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      {a.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <LogsFilters
          currentAction={params.action}
          currentEntity={params.entity}
          currentStartDate={params.startDate}
          currentEndDate={params.endDate}
        />

        {/* Logs Table */}
        <LogsTable
          logs={logsResult.logs}
          currentPage={logsResult.currentPage}
          totalPages={logsResult.pages}
          total={logsResult.total}
        />
      </div>
    </div>
  );
}
