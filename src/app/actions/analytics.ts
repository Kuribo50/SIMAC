"use server";

import prisma from "@/lib/prisma";

export type AnalyticsItem = {
  id: string; // ID or Name depending on level
  name: string;
  total: number;
  ok: number;
  notOk: number;
  planned: number;
  unassigned: number;
  color?: string | null; // Added color
  // Optional children or metadata
  type: "PAUTA" | "ESTABLECIMIENTO" | "AREA" | "EQUIPO";
  tipoPauta?: "RECURSO_HUMANO" | "INFRAESTRUCTURA" | "EQUIPAMIENTO";
  // Métricas adicionales de cumplimiento
  mantencionesCompletadas?: number;
  mantencionesPendientes?: number;
  cumplimientoPercent?: number;
};

// Estadísticas globales para el dashboard
export type GlobalStats = {
  totalEquipos: number;
  equiposOperativos: number;
  equiposNoOperativos: number;
  porcentajeOperativos: number;
  totalMantenciones: number;
  mantencionesCompletadas: number;
  mantencionesPendientes: number;
  porcentajeCumplimiento: number;
  // Por categoría
  equiposRH: number;
  equiposINS: number;
  equiposEQ: number;
  // Mantenciones por tipo
  mantencionesPreventivas: number;
  mantencionesCorrectivas: number;
  // Próximas mantenciones vencidas o por vencer
  mantencionesVencidas: number;
  mantencionesPorVencer: number;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Total equipos activos
    const totalEquipos = await prisma.equipo.count({ where: { activo: true } });

    // Equipos operativos
    const equiposOperativos = await prisma.equipo.count({
      where: { activo: true, estado: "OPERATIVO" },
    });

    // Equipos no operativos
    const equiposNoOperativos = totalEquipos - equiposOperativos;

    // Total mantenciones
    const totalMantenciones = await prisma.mantencion.count();

    // Mantenciones completadas
    const mantencionesCompletadas = await prisma.mantencion.count({
      where: { estadoMantencion: "COMPLETADA" },
    });

    // Mantenciones pendientes
    const mantencionesPendientes = await prisma.mantencion.count({
      where: { estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] } },
    });

    // Equipos por categoría de pauta
    const equiposRH = await prisma.equipo.count({
      where: {
        activo: true,
        pautaAsignada: { tipo: "RECURSO_HUMANO" },
      },
    });

    const equiposINS = await prisma.equipo.count({
      where: {
        activo: true,
        pautaAsignada: { tipo: "INFRAESTRUCTURA" },
      },
    });

    const equiposEQ = await prisma.equipo.count({
      where: {
        activo: true,
        pautaAsignada: { tipo: "EQUIPAMIENTO" },
      },
    });

    // Mantenciones por tipo
    const mantencionesPreventivas = await prisma.mantencion.count({
      where: { tipoMantencion: "PREVENTIVO" },
    });

    const mantencionesCorrectivas = await prisma.mantencion.count({
      where: { tipoMantencion: "CORRECTIVO" },
    });

    // Mantenciones vencidas (fecha pasada y pendiente)
    const mantencionesVencidas = await prisma.mantencion.count({
      where: {
        estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] },
        fecha: { lt: now },
      },
    });

    // Mantenciones por vencer (próximos 7 días)
    const mantencionesPorVencer = await prisma.mantencion.count({
      where: {
        estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] },
        fecha: { gte: now, lte: in7Days },
      },
    });

    return {
      totalEquipos,
      equiposOperativos,
      equiposNoOperativos,
      porcentajeOperativos:
        totalEquipos > 0
          ? Math.round((equiposOperativos / totalEquipos) * 100)
          : 0,
      totalMantenciones,
      mantencionesCompletadas,
      mantencionesPendientes,
      porcentajeCumplimiento:
        totalMantenciones > 0
          ? Math.round((mantencionesCompletadas / totalMantenciones) * 100)
          : 0,
      equiposRH,
      equiposINS,
      equiposEQ,
      mantencionesPreventivas,
      mantencionesCorrectivas,
      mantencionesVencidas,
      mantencionesPorVencer,
    };
  } catch (error) {
    console.error("Error fetching global stats:", error);
    return {
      totalEquipos: 0,
      equiposOperativos: 0,
      equiposNoOperativos: 0,
      porcentajeOperativos: 0,
      totalMantenciones: 0,
      mantencionesCompletadas: 0,
      mantencionesPendientes: 0,
      porcentajeCumplimiento: 0,
      equiposRH: 0,
      equiposINS: 0,
      equiposEQ: 0,
      mantencionesPreventivas: 0,
      mantencionesCorrectivas: 0,
      mantencionesVencidas: 0,
      mantencionesPorVencer: 0,
    };
  }
}

export type EquipmentItem = {
  id: string;
  name: string;
  serie: string | null;
  estado: string;
  pauta: string | null;
  proximaMantencion: string | null; // Changed to string for serialization safety
  estadoMantencion: string | null;
  color?: string | null; // Added color
};

export async function getPautasAnalytics(): Promise<AnalyticsItem[]> {
  try {
    const pautas = await prisma.pautaMantenimiento.findMany({
      where: { activo: true },
      include: {
        equiposAsignados: {
          include: {
            mantenciones: {
              where: {
                estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] },
              },
              take: 1,
            },
          },
        },
      },
    });

    const result: AnalyticsItem[] = pautas.map((pauta) => {
      const total = pauta.equiposAsignados.length;
      const ok = pauta.equiposAsignados.filter(
        (e) => e.estado === "OPERATIVO"
      ).length;
      const notOk = total - ok;
      const planned = pauta.equiposAsignados.filter(
        (e) => e.mantenciones.length > 0
      ).length;
      const unassigned = total - planned;

      return {
        id: pauta.id,
        name: pauta.nombre,
        total,
        ok,
        notOk,
        planned,
        unassigned,
        type: "PAUTA" as const,
        color: null,
        tipoPauta: pauta.tipo,
      };
    });

    // Handle "Sin Pauta" (Unassigned Equipment)
    const unassignedEquipos = await prisma.equipo.count({
      where: {
        pautaAsignadaId: null,
        activo: true,
      },
    });

    if (unassignedEquipos > 0) {
      // We need more details if we want to drill down, so let's fetch them if count > 0
      // Actually for the root list, just counts are enough?
      // But if we drill down we need logic.
      // For now let's just show the count. Drill down for "Sin Pauta" is tricky if we reuse logic.
      // Let's create a special ID for it.

      const unassignedOk = await prisma.equipo.count({
        where: { pautaAsignadaId: null, activo: true, estado: "OPERATIVO" },
      });
      // Unassigned pauta means surely unassigned maintenance? usually yes unless manually created.
      // Let's assume unplanned for now as per logic "planned = has pending maintenance"
      // But we can check.
      const unassignedPlanned = await prisma.equipo.count({
        where: {
          pautaAsignadaId: null,
          activo: true,
          mantenciones: {
            some: { estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] } },
          },
        },
      });

      result.push({
        id: "SIN_PAUTA",
        name: "Sin Pauta Asignada",
        total: unassignedEquipos,
        ok: unassignedOk,
        notOk: unassignedEquipos - unassignedOk,
        planned: unassignedPlanned,
        unassigned: unassignedEquipos - unassignedPlanned,
        type: "PAUTA",
        color: "#94a3b8", // Slate 400
        tipoPauta: "EQUIPAMIENTO", // Default to Equipamiento or maybe a specific "Unassigned" type? Let's use Equipamiento for now or sort it last.
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching pautas analytics:", error);
    return [];
  }
}

export async function getEstablecimientosAnalytics(
  pautaId: string
): Promise<AnalyticsItem[]> {
  try {
    const whereClause: any = { activo: true };
    if (pautaId === "SIN_PAUTA") {
      whereClause.pautaAsignadaId = null;
    } else {
      whereClause.pautaAsignadaId = pautaId;
    }

    const equipos = await prisma.equipo.findMany({
      where: whereClause,
      include: {
        ubicacion: true,
        mantenciones: {
          where: {
            estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] },
          },
          take: 1,
        },
      },
    });

    // Group by establecimiento
    const grouped = new Map<string, typeof equipos>();
    // Metadata map for colors
    const meta = new Map<string, { color: string | null }>();

    equipos.forEach((eq) => {
      const est = eq.ubicacion.establecimiento;
      if (!grouped.has(est)) {
        grouped.set(est, []);
        meta.set(est, { color: eq.ubicacion.colorEstablecimiento });
      }
      grouped.get(est)!.push(eq);
    });

    const result: AnalyticsItem[] = [];

    grouped.forEach((groupEquipos, establecimientoName) => {
      const total = groupEquipos.length;
      const ok = groupEquipos.filter((e) => e.estado === "OPERATIVO").length;
      const notOk = total - ok;
      const planned = groupEquipos.filter(
        (e) => e.mantenciones.length > 0
      ).length;
      // "Por Asignar" logic: Equipment that should have maintenance but doesn't.
      const unassigned = total - planned;

      result.push({
        id: establecimientoName,
        name: establecimientoName,
        total,
        ok,
        notOk,
        planned,
        unassigned,
        type: "ESTABLECIMIENTO",
        color: meta.get(establecimientoName)?.color || null,
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching establecimientos analytics:", error);
    return [];
  }
}

export async function getAreasAnalytics(
  pautaId: string,
  establecimientoName: string
): Promise<AnalyticsItem[]> {
  try {
    const whereClause: any = {
      activo: true,
      ubicacion: {
        establecimiento: establecimientoName,
      },
    };
    if (pautaId === "SIN_PAUTA") {
      whereClause.pautaAsignadaId = null;
    } else {
      whereClause.pautaAsignadaId = pautaId;
    }

    const equipos = await prisma.equipo.findMany({
      where: whereClause,
      include: {
        ubicacion: true,
        mantenciones: {
          where: {
            estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] },
          },
          take: 1,
        },
      },
    });

    // Group by Area
    const grouped = new Map<string, typeof equipos>();
    const meta = new Map<string, { color: string | null }>();

    equipos.forEach((eq) => {
      const area = eq.ubicacion.area;
      if (!grouped.has(area)) {
        grouped.set(area, []);
        meta.set(area, { color: eq.ubicacion.color });
      }
      grouped.get(area)!.push(eq);
    });

    const result: AnalyticsItem[] = [];

    grouped.forEach((groupEquipos, areaName) => {
      const total = groupEquipos.length;
      const ok = groupEquipos.filter((e) => e.estado === "OPERATIVO").length;
      const notOk = total - ok;
      const planned = groupEquipos.filter(
        (e) => e.mantenciones.length > 0
      ).length;
      const unassigned = total - planned;

      result.push({
        id: areaName,
        name: areaName,
        total,
        ok,
        notOk,
        planned,
        unassigned,
        type: "AREA",
        color: meta.get(areaName)?.color || null,
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching areas analytics:", error);
    return [];
  }
}

export async function getEquiposAnalytics(
  pautaId: string,
  establecimientoName: string,
  areaName: string
): Promise<EquipmentItem[]> {
  try {
    const whereClause: any = {
      activo: true,
      ubicacion: {
        establecimiento: establecimientoName,
        area: areaName,
      },
    };
    if (pautaId === "SIN_PAUTA") {
      whereClause.pautaAsignadaId = null;
    } else {
      whereClause.pautaAsignadaId = pautaId;
    }

    const equipos = await prisma.equipo.findMany({
      where: whereClause,
      include: {
        pautaAsignada: true,
        ubicacion: true, // Needed for color? Maybe not
        mantenciones: {
          where: {
            estadoMantencion: { in: ["PENDIENTE", "EN_PROCESO"] },
          },
          orderBy: { fecha: "asc" },
          take: 1,
        },
      },
      orderBy: { nombre: "asc" },
    });

    return equipos.map((eq) => ({
      id: eq.id,
      name: eq.nombre,
      serie: eq.serie,
      estado: eq.estado,
      pauta: eq.pautaAsignada?.nombre || null,
      proximaMantencion: eq.mantenciones[0]?.fecha
        ? eq.mantenciones[0].fecha.toISOString()
        : null,
      estadoMantencion: eq.mantenciones[0]?.estadoMantencion || null,
      color: null, // Equipments don't have color usually, but we could inherit from area?
    }));
  } catch (error) {
    console.error("Error fetching equipos analytics:", error);
    return [];
  }
}
