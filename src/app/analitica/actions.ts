"use server";

import prisma from "@/lib/prisma";
import { EstadoMantencion, Periodicidad, EstadoEquipo } from "@prisma/client";

// Tipos exportados para la página
export type EquipoSinMantencion = {
  id: string;
  nombre: string;
  marca: string | null;
  modelo: string | null;
  periodicidad: Periodicidad | null;
  ubicacion: {
    area: string;
    establecimiento: string;
  };
};

export type ProximaMantencion = {
  id: string;
  fecha: Date;
  tipoMantencion: string;
  equipo: {
    nombre: string;
    ubicacion: {
      establecimiento: string;
    };
  };
  pauta: {
    nombre: string;
  } | null;
};

export type DistribucionPeriodicidad = {
  periodicidad: Periodicidad | null;
  count: number;
};

export type DistribucionEstablecimiento = {
  establecimiento: string;
  count: number;
};

export type MantencionMes = {
  mes: string;
  total: number;
  completadas: number;
};

export async function getAnalyticStats() {
  const [
    totalEquipos,
    equiposOperativos,
    equiposSinMantencion,
    totalMantenciones,
    mantencionesCompletadas,
    mantencionesPendientes,
    mantencionesEnProceso,
    pautasMensual,
    pautasBimestral,
    pautasTrimestral,
    pautasSemestral,
    pautasAnual,
    pautasNoAplica,
  ] = await Promise.all([
    // Total de equipos activos
    prisma.equipo.count({ where: { activo: true } }),
    // Equipos operativos
    prisma.equipo.count({
      where: { activo: true, estado: EstadoEquipo.OPERATIVO },
    }),
    // Equipos sin ninguna mantención
    prisma.equipo.count({
      where: {
        activo: true,
        mantenciones: { none: {} },
      },
    }),
    // Total de mantenciones
    prisma.mantencion.count(),
    // Mantenciones completadas
    prisma.mantencion.count({
      where: { estadoMantencion: EstadoMantencion.COMPLETADA },
    }),
    // Mantenciones pendientes
    prisma.mantencion.count({
      where: { estadoMantencion: EstadoMantencion.PENDIENTE },
    }),
    // Mantenciones en proceso
    prisma.mantencion.count({
      where: { estadoMantencion: EstadoMantencion.EN_PROCESO },
    }),
    // Pautas por periodicidad
    prisma.pautaMantenimiento.count({
      where: { activo: true, periodicidadBase: Periodicidad.MENSUAL },
    }),
    prisma.pautaMantenimiento.count({
      where: { activo: true, periodicidadBase: Periodicidad.BIMESTRAL },
    }),
    prisma.pautaMantenimiento.count({
      where: { activo: true, periodicidadBase: Periodicidad.TRIMESTRAL },
    }),
    prisma.pautaMantenimiento.count({
      where: { activo: true, periodicidadBase: Periodicidad.SEMESTRAL },
    }),
    prisma.pautaMantenimiento.count({
      where: { activo: true, periodicidadBase: Periodicidad.ANUAL },
    }),
    prisma.pautaMantenimiento.count({
      where: { activo: true, periodicidadBase: Periodicidad.NO_APLICA },
    }),
  ]);

  return {
    totalEquipos,
    equiposOperativos,
    equiposSinMantencion,
    totalMantenciones,
    mantencionesCompletadas,
    mantencionesPendientes,
    mantencionesEnProceso,
    pautasMensual,
    pautasBimestral,
    pautasTrimestral,
    pautasSemestral,
    pautasAnual,
    pautasNoAplica,
  };
}

export async function getEquiposSinMantencion() {
  const equipos = await prisma.equipo.findMany({
    where: {
      activo: true,
      mantenciones: { none: {} },
    },
    select: {
      id: true,
      nombre: true,
      marca: true,
      modelo: true,
      periodicidad: true,
      ubicacion: {
        select: {
          area: true,
          establecimiento: true,
        },
      },
    },
    orderBy: { nombre: "asc" },
    take: 20,
  });

  return equipos;
}

export async function getProximasMantenciones() {
  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(en30Dias.getDate() + 30);

  const mantenciones = await prisma.mantencion.findMany({
    where: {
      estadoMantencion: EstadoMantencion.PENDIENTE,
      fecha: {
        gte: hoy,
        lte: en30Dias,
      },
    },
    select: {
      id: true,
      fecha: true,
      tipoMantencion: true,
      equipo: {
        select: {
          nombre: true,
          ubicacion: {
            select: {
              establecimiento: true,
            },
          },
        },
      },
      pauta: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: { fecha: "asc" },
    take: 15,
  });

  return mantenciones;
}

export async function getDistribucionPorPeriodicidad() {
  const mantenciones = await prisma.mantencion.groupBy({
    by: ["periodicidad"],
    _count: {
      periodicidad: true,
    },
    where: {
      periodicidad: { not: null },
    },
  });

  return mantenciones.map((m) => ({
    periodicidad: m.periodicidad,
    count: m._count.periodicidad,
  }));
}

export async function getDistribucionPorEstablecimiento() {
  const equipos = await prisma.equipo.findMany({
    where: { activo: true },
    select: {
      ubicacion: {
        select: {
          establecimiento: true,
        },
      },
    },
  });

  // Agrupar manualmente
  const countByEstablecimiento: Record<string, number> = {};
  equipos.forEach((equipo) => {
    const est = equipo.ubicacion.establecimiento;
    countByEstablecimiento[est] = (countByEstablecimiento[est] || 0) + 1;
  });

  return Object.entries(countByEstablecimiento)
    .map(([establecimiento, count]) => ({ establecimiento, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export async function getMantencionesPorMes() {
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);

  const mantenciones = await prisma.mantencion.findMany({
    where: {
      fecha: { gte: hace6Meses },
    },
    select: {
      fecha: true,
      estadoMantencion: true,
    },
  });

  // Agrupar por mes
  const porMes: Record<string, { total: number; completadas: number }> = {};

  mantenciones.forEach((m) => {
    const fecha = new Date(m.fecha);
    const mesKey = `${fecha.getFullYear()}-${String(
      fecha.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!porMes[mesKey]) {
      porMes[mesKey] = { total: 0, completadas: 0 };
    }

    porMes[mesKey].total++;
    if (m.estadoMantencion === EstadoMantencion.COMPLETADA) {
      porMes[mesKey].completadas++;
    }
  });

  // Convertir a array y formatear
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  return Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, data]) => {
      const [year, month] = key.split("-");
      return {
        mes: `${meses[parseInt(month) - 1]} ${year.slice(2)}`,
        total: data.total,
        completadas: data.completadas,
      };
    });
}
