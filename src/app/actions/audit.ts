"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  getAuditLogs,
  getAuditStats,
  AuditAction,
  AuditEntity,
} from "@/lib/audit";

export async function fetchAuditLogs(options?: {
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para ver los logs");
  }

  const limit = options?.limit || 50;
  const offset = ((options?.page || 1) - 1) * limit;

  const result = await getAuditLogs({
    userId: options?.userId,
    entity: options?.entity as AuditEntity,
    action: options?.action as AuditAction,
    startDate: options?.startDate ? new Date(options.startDate) : undefined,
    endDate: options?.endDate ? new Date(options.endDate) : undefined,
    limit,
    offset,
  });

  return {
    logs: result.logs,
    total: result.total,
    pages: Math.ceil(result.total / limit),
    currentPage: options?.page || 1,
  };
}

export async function fetchAuditStats() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para ver las estadísticas");
  }

  return getAuditStats();
}

// Tipos para exportar
export type { AuditAction, AuditEntity };
