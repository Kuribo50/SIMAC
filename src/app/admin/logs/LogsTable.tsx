"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import {
  ACTION_COLORS,
  ACTION_LABELS,
  ENTITY_LABELS,
} from "@/lib/audit-constants";

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  createdAt: Date;
}

interface LogsTableProps {
  logs: AuditLog[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function LogsTable({
  logs,
  currentPage,
  totalPages,
  total,
}: LogsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/admin/logs?${params.toString()}`);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    return (
      ACTION_COLORS[action as keyof typeof ACTION_COLORS] || {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-700 dark:text-slate-300",
      }
    );
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action as keyof typeof ACTION_LABELS] || action;
  };

  const getEntityLabel = (entity: string) => {
    return ENTITY_LABELS[entity as keyof typeof ENTITY_LABELS] || entity;
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No hay registros
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          No se encontraron logs con los filtros seleccionados
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Acción
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Entidad
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => {
              const colors = getActionColor(log.action);
              const details = parseDetails(log.details);

              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      {formatDate(log.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs font-bold shadow-sm">
                        {log.userName?.charAt(0).toUpperCase() ||
                          log.userEmail?.charAt(0).toUpperCase() ||
                          "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {log.userName || "Sistema"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {log.userEmail || "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${colors.bg} ${colors.text}`}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {getEntityLabel(log.entity)}
                      </p>
                      {log.entityName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {log.entityName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {details ? (
                      <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[300px] bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                        {Object.entries(details)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className="truncate">
                              <span className="text-slate-400 dark:text-slate-500 font-medium">
                                {key}:
                              </span>{" "}
                              {String(value)}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mostrando página {currentPage} de {totalPages} ({total} registros)
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`w-8 h-8 text-sm font-medium rounded-lg transition-all ${
                  pageNum === currentPage
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                    : "border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
