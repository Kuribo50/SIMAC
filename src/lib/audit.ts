import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";

// Re-exportar tipos y constantes desde audit-constants para mantener compatibilidad
export * from "./audit-constants";

// Importar tipos necesarios
import type { AuditAction, AuditEntity } from "./audit-constants";

interface LogParams {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

/**
 * Registra una acción en el log de auditoría
 */
export async function logAudit(params: LogParams): Promise<void> {
  try {
    // Intentar obtener el usuario actual si no se proporciona
    let user = null;
    if (!params.userId) {
      user = await getCurrentUser();
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId || user?.id || null,
        userName: params.userName || user?.name || null,
        userEmail: params.userEmail || user?.email || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        entityName: params.entityName || null,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    });
  } catch (error) {
    // No lanzar error para no interrumpir la operación principal
    console.error("Error al registrar log de auditoría:", error);
  }
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuditLogs(options?: {
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.userId) {
    where.userId = options.userId;
  }
  if (options?.entity) {
    where.entity = options.entity;
  }
  if (options?.action) {
    where.action = options.action;
  }
  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      (where.createdAt as Record<string, Date>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.createdAt as Record<string, Date>).lte = options.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Obtener estadísticas de auditoría
 */
export async function getAuditStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalToday, byAction, byEntity, recentUsers] = await Promise.all([
    // Total de acciones hoy
    prisma.auditLog.count({
      where: { createdAt: { gte: today } },
    }),
    // Acciones por tipo (últimos 7 días)
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: true,
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    // Acciones por entidad (últimos 7 días)
    prisma.auditLog.groupBy({
      by: ["entity"],
      _count: true,
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    // Usuarios más activos (últimos 7 días)
    prisma.auditLog.groupBy({
      by: ["userId", "userName"],
      _count: true,
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        userId: { not: null },
      },
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    }),
  ]);

  return {
    totalToday,
    byAction: byAction.map((a) => ({ action: a.action, count: a._count })),
    byEntity: byEntity.map((e) => ({ entity: e.entity, count: e._count })),
    recentUsers: recentUsers.map((u) => ({
      userId: u.userId,
      userName: u.userName,
      count: u._count,
    })),
  };
}
