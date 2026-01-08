"use server";

import { prisma } from "@/lib/prisma";
import { revalidateGlobal } from "@/lib/revalidation";

// Tipos de notificación
export type TipoNotificacion =
  | "MANTENCION_PROXIMA"
  | "MANTENCION_HOY"
  | "MANTENCION_ATRASADA"
  | "MANTENCION_FIRMADA"
  | "MANTENCION_COMPLETADA"
  | "MANTENCION_PROGRAMADA"
  | "SISTEMA";

// Obtener notificaciones (no leídas primero)
export async function getNotificaciones(options?: {
  soloNoLeidas?: boolean;
  limite?: number;
}) {
  const { soloNoLeidas = false, limite = 50 } = options || {};

  const notificaciones = await prisma.notificacion.findMany({
    where: soloNoLeidas ? { leida: false } : undefined,
    include: {
      mantencion: {
        include: {
          equipo: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: [{ leida: "asc" }, { createdAt: "desc" }],
    take: limite,
  });

  return notificaciones;
}

// Contar notificaciones no leídas
export async function contarNotificacionesNoLeidas() {
  const count = await prisma.notificacion.count({
    where: { leida: false },
  });
  return count;
}

// Marcar notificación como leída
export async function marcarNotificacionLeida(id: string) {
  await prisma.notificacion.update({
    where: { id },
    data: { leida: true },
  });
  await revalidateGlobal();
}

// Marcar todas como leídas
export async function marcarTodasLeidas() {
  await prisma.notificacion.updateMany({
    where: { leida: false },
    data: { leida: true },
  });
  await revalidateGlobal();
}

// Eliminar notificación
export async function eliminarNotificacion(id: string) {
  await prisma.notificacion.delete({
    where: { id },
  });
  await revalidateGlobal();
}

// Crear notificación
export async function crearNotificacion(data: {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  mantencionId?: string;
  equipoId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}) {
  const notificacion = await prisma.notificacion.create({
    data: {
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje,
      mantencionId: data.mantencionId,
      equipoId: data.equipoId,
      userId: data.userId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });

  await revalidateGlobal();
  return notificacion;
}

// Verificar y crear notificaciones de mantenciones próximas
// Esta función debe ejecutarse periódicamente (cron job o al cargar la app)
export async function verificarMantencionesProximas() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const en3Dias = new Date(hoy);
  en3Dias.setDate(en3Dias.getDate() + 3);

  const en7Dias = new Date(hoy);
  en7Dias.setDate(en7Dias.getDate() + 7);

  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  // Obtener mantenciones pendientes
  const mantenciones = await prisma.mantencion.findMany({
    where: {
      estadoMantencion: "PENDIENTE",
      fecha: {
        gte: hoy,
        lte: en7Dias,
      },
    },
    include: {
      equipo: true,
      notificaciones: {
        where: {
          createdAt: {
            gte: hoy,
          },
        },
      },
    },
  });

  const notificacionesCreadas: string[] = [];

  for (const mant of mantenciones) {
    const fechaMant = new Date(mant.fecha);
    fechaMant.setHours(0, 0, 0, 0);

    const diasRestantes = Math.ceil(
      (fechaMant.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Verificar si ya existe una notificación del mismo tipo hoy
    const tipoNotif =
      diasRestantes === 0
        ? "MANTENCION_HOY"
        : diasRestantes <= 3
        ? "MANTENCION_PROXIMA"
        : "MANTENCION_PROXIMA";

    const yaNotificado = mant.notificaciones.some((n) => n.tipo === tipoNotif);

    if (!yaNotificado) {
      let titulo = "";
      let mensaje = "";

      if (diasRestantes === 0) {
        titulo = "🔔 Mantención programada para HOY";
        mensaje = `El equipo "${mant.equipo.nombre}" tiene una mantención programada para hoy.`;
      } else if (diasRestantes === 1) {
        titulo = "⏰ Mantención mañana";
        mensaje = `El equipo "${mant.equipo.nombre}" tiene una mantención programada para mañana.`;
      } else if (diasRestantes <= 3) {
        titulo = `📅 Mantención en ${diasRestantes} días`;
        mensaje = `El equipo "${
          mant.equipo.nombre
        }" tiene una mantención programada para el ${fechaMant.toLocaleDateString(
          "es-CL"
        )}.`;
      } else {
        titulo = `📆 Mantención próxima semana`;
        mensaje = `El equipo "${
          mant.equipo.nombre
        }" tiene una mantención programada para el ${fechaMant.toLocaleDateString(
          "es-CL"
        )} (en ${diasRestantes} días).`;
      }

      await crearNotificacion({
        tipo: tipoNotif,
        titulo,
        mensaje,
        mantencionId: mant.id,
        equipoId: mant.equipoId,
        metadata: {
          diasRestantes,
          fechaProgramada: mant.fecha.toISOString(),
        },
      });

      notificacionesCreadas.push(mant.id);
    }
  }

  // Verificar mantenciones atrasadas
  const mantencionesAtrasadas = await prisma.mantencion.findMany({
    where: {
      estadoMantencion: "PENDIENTE",
      fecha: {
        lt: hoy,
      },
    },
    include: {
      equipo: true,
      notificaciones: {
        where: {
          tipo: "MANTENCION_ATRASADA",
          createdAt: {
            gte: new Date(hoy.getTime() - 24 * 60 * 60 * 1000), // últimas 24 horas
          },
        },
      },
    },
  });

  for (const mant of mantencionesAtrasadas) {
    const yaNotificado = mant.notificaciones.length > 0;

    if (!yaNotificado) {
      const fechaMant = new Date(mant.fecha);
      const diasAtrasados = Math.ceil(
        (hoy.getTime() - fechaMant.getTime()) / (1000 * 60 * 60 * 24)
      );

      await crearNotificacion({
        tipo: "MANTENCION_ATRASADA",
        titulo: "⚠️ Mantención atrasada",
        mensaje: `El equipo "${
          mant.equipo.nombre
        }" tiene una mantención atrasada por ${diasAtrasados} día(s). Fecha original: ${fechaMant.toLocaleDateString(
          "es-CL"
        )}.`,
        mantencionId: mant.id,
        equipoId: mant.equipoId,
        metadata: {
          diasAtrasados,
          fechaOriginal: mant.fecha.toISOString(),
        },
      });

      notificacionesCreadas.push(mant.id);
    }
  }

  return {
    verificadas: mantenciones.length + mantencionesAtrasadas.length,
    notificacionesCreadas: notificacionesCreadas.length,
  };
}

// Notificar cuando se firma una mantención
export async function notificarFirma(
  mantencionId: string,
  rolFirma: string,
  nombreFirmante: string
) {
  const mantencion = await prisma.mantencion.findUnique({
    where: { id: mantencionId },
    include: { equipo: true },
  });

  if (!mantencion) return;

  const rolTexto =
    rolFirma === "TECNICO"
      ? "Técnico"
      : rolFirma === "RESPONSABLE"
      ? "Responsable"
      : "Supervisor";

  await crearNotificacion({
    tipo: "MANTENCION_FIRMADA",
    titulo: `✍️ Mantención firmada por ${rolTexto}`,
    mensaje: `${nombreFirmante} ha firmado como ${rolTexto} la mantención del equipo "${mantencion.equipo.nombre}".`,
    mantencionId: mantencion.id,
    equipoId: mantencion.equipoId,
    metadata: {
      rolFirma,
      nombreFirmante,
    },
  });
}

// Notificar cuando se completa una mantención
export async function notificarMantencionCompletada(mantencionId: string) {
  const mantencion = await prisma.mantencion.findUnique({
    where: { id: mantencionId },
    include: { equipo: true },
  });

  if (!mantencion) return;

  await crearNotificacion({
    tipo: "MANTENCION_COMPLETADA",
    titulo: "✅ Mantención completada",
    mensaje: `La mantención del equipo "${mantencion.equipo.nombre}" ha sido completada exitosamente.`,
    mantencionId: mantencion.id,
    equipoId: mantencion.equipoId,
  });
}

// Notificar cuando se programa una mantención
export async function notificarMantencionProgramada(mantencionId: string) {
  const mantencion = await prisma.mantencion.findUnique({
    where: { id: mantencionId },
    include: { equipo: true },
  });

  if (!mantencion) return;

  const fechaFormateada = new Date(mantencion.fecha).toLocaleDateString(
    "es-CL",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  await crearNotificacion({
    tipo: "MANTENCION_PROGRAMADA",
    titulo: "📋 Nueva mantención programada",
    mensaje: `Se ha programado una mantención para el equipo "${mantencion.equipo.nombre}" el ${fechaFormateada}.`,
    mantencionId: mantencion.id,
    equipoId: mantencion.equipoId,
    metadata: {
      fecha: mantencion.fecha.toISOString(),
      tipoMantencion: mantencion.tipoMantencion,
    },
  });
}
