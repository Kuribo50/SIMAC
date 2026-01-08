"use server";

import prisma from "../../lib/prisma";
import { EstadoEquipo, EstadoMantencion } from "@prisma/client";

// Función auxiliar para obtener lista de centros
export async function getCentros() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      select: { establecimiento: true },
      distinct: ["establecimiento"],
      orderBy: { establecimiento: "asc" },
    });
    return ubicaciones
      .map((u) => u.establecimiento)
      .filter((e): e is string => e !== null);
  } catch (error) {
    console.error("Error fetching centros:", error);
    return [];
  }
}

export async function getDashboardStats(centro?: string) {
  try {
    // Filtro base por centro si existe
    const whereCentro = centro
      ? { equipo: { ubicacion: { establecimiento: centro } } }
      : {};

    const whereEquipoCentro = centro
      ? { ubicacion: { establecimiento: centro } }
      : {};

    // Fecha de hoy y hace 7 días
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Primer día del mes actual y anterior
    const firstDayThisMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const firstDayLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalEquipos,
      equiposOperativos,
      equiposNoOperativos,
      equiposFueraServicio,
      mantencionesCompletadas,
      mantencionesPendientes,
      mantencionesEnProceso,
      mantencionesVencidas,
      ubicacionesCount,
      // Mantenciones del mes actual
      mantencionesThisMonth,
      mantencionesLastMonth,
      // Actividad de 7 días
      activityLast7Days,
      // Mantenciones recientes
      recentMaintenances,
      // Próximas mantenciones
      upcomingMaintenances,
    ] = await Promise.all([
      // Conteos básicos de equipos
      prisma.equipo.count({ where: whereEquipoCentro }),
      prisma.equipo.count({
        where: { ...whereEquipoCentro, estado: EstadoEquipo.OPERATIVO },
      }),
      prisma.equipo.count({
        where: { ...whereEquipoCentro, estado: EstadoEquipo.NO_OPERATIVO },
      }),
      prisma.equipo.count({
        where: { ...whereEquipoCentro, estado: EstadoEquipo.FUERA_SERVICIO },
      }),

      // Conteos de mantenciones (aplicando filtro de equipo->ubicacion->establecimiento)
      prisma.mantencion.count({
        where: {
          ...whereCentro,
          estadoMantencion: EstadoMantencion.COMPLETADA,
        },
      }),
      prisma.mantencion.count({
        where: { ...whereCentro, estadoMantencion: EstadoMantencion.PENDIENTE },
      }),
      prisma.mantencion.count({
        where: {
          ...whereCentro,
          estadoMantencion: EstadoMantencion.EN_PROCESO,
        },
      }),
      // Mantenciones Vencidas (Pendientes con fecha anterior a hoy)
      prisma.mantencion.count({
        where: {
          ...whereCentro,
          estadoMantencion: { in: [EstadoMantencion.PENDIENTE] },
          fecha: { lt: today },
        },
      }),
      prisma.ubicacion.count(), // Total ubicaciones (no afectado por filtro de centro generalmente, o sí? Dejémoslo global por ahora o filtrado?) Si filtro por centro, debería contar 1? Mejor global para contexto.

      // Trending: mantenciones este mes vs mes anterior
      prisma.mantencion.count({
        where: {
          ...whereCentro,
          estadoMantencion: EstadoMantencion.COMPLETADA,
          createdAt: {
            gte: firstDayThisMonth,
          },
        },
      }),
      prisma.mantencion.count({
        where: {
          ...whereCentro,
          estadoMantencion: EstadoMantencion.COMPLETADA,
          createdAt: {
            gte: firstDayLastMonth,
            lte: lastDayLastMonth,
          },
        },
      }),

      // Actividad de mantenciones en últimos 7 días
      prisma.mantencion.findMany({
        where: {
          ...whereCentro,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          id: true,
          estadoMantencion: true,
          createdAt: true,
        },
      }),

      // Últimas 5 mantenciones completadas
      prisma.mantencion.findMany({
        where: {
          ...whereCentro,
          estadoMantencion: EstadoMantencion.COMPLETADA,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        include: {
          equipo: {
            select: {
              nombre: true,
              serie: true,
            },
          },
        },
      }),

      // Próximas 5 mantenciones programadas
      prisma.mantencion.findMany({
        where: {
          ...whereCentro,
          estadoMantencion: {
            in: [EstadoMantencion.PENDIENTE, EstadoMantencion.EN_PROCESO],
          },
          fecha: {
            gte: today, // Futuras y hoy
          },
        },
        orderBy: {
          fecha: "asc",
        },
        take: 5,
        include: {
          equipo: {
            select: {
              nombre: true,
              serie: true,
            },
          },
        },
      }),
    ]);

    // Procesar actividad por día (últimos 7 días)
    const activityByDay = [];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayData = activityLast7Days.filter((m) => {
        const mDate = new Date(m.createdAt);
        return mDate >= date && mDate < nextDate;
      });

      activityByDay.push({
        name: dayNames[date.getDay()],
        completadas: dayData.filter(
          (m) => m.estadoMantencion === EstadoMantencion.COMPLETADA
        ).length,
        enProceso: dayData.filter(
          (m) => m.estadoMantencion === EstadoMantencion.EN_PROCESO
        ).length,
        pendientes: dayData.filter(
          (m) => m.estadoMantencion === EstadoMantencion.PENDIENTE
        ).length,
      });
    }

    // Calcular distribución de equipos con porcentajes
    const equipmentDistribution = [
      {
        name: "Operativo",
        value: equiposOperativos,
        percentage:
          totalEquipos > 0
            ? ((equiposOperativos / totalEquipos) * 100).toFixed(1)
            : "0",
        color: "#10b981", // emerald-500
      },
      {
        name: "No Operativo",
        value: equiposNoOperativos,
        percentage:
          totalEquipos > 0
            ? ((equiposNoOperativos / totalEquipos) * 100).toFixed(1)
            : "0",
        color: "#f59e0b", // amber-500
      },
      {
        name: "Fuera de Servicio",
        value: equiposFueraServicio,
        percentage:
          totalEquipos > 0
            ? ((equiposFueraServicio / totalEquipos) * 100).toFixed(1)
            : "0",
        color: "#ef4444", // red-500
      },
    ];

    // Calcular trending
    const trendMaintenance =
      mantencionesLastMonth > 0
        ? (
            ((mantencionesThisMonth - mantencionesLastMonth) /
              mantencionesLastMonth) *
            100
          ).toFixed(1)
        : "0";

    // Calcular Eficiencia Global (Completadas / Total * 100)
    // Total = Completadas + Pendientes + En Proceso + Vencidas
    const totalMantencionesActivas =
      mantencionesCompletadas + mantencionesPendientes + mantencionesEnProceso;
    const eficienciaGlobal =
      totalMantencionesActivas > 0
        ? ((mantencionesCompletadas / totalMantencionesActivas) * 100).toFixed(
            1
          )
        : "0";

    return {
      // Conteos básicos
      totalEquipos,
      equiposOperativos,
      equiposNoOperativos,
      equiposFueraServicio,
      mantencionesCompletadas,
      mantencionesPendientes,
      mantencionesEnProceso,
      mantencionesVencidas,
      ubicacionesCount,
      eficienciaGlobal,

      // Nuevos datos
      activityByDay,
      equipmentDistribution,
      recentMaintenances,
      upcomingMaintenances,

      // Trending
      trendMaintenance,
      mantencionesThisMonth,
      mantencionesLastMonth,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}
