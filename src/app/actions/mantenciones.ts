"use server";

import prisma from "@/lib/prisma";
import { TipoMantencion, EstadoMantencion, EstadoEquipo } from "@prisma/client";
import { revalidateGlobal } from "@/lib/revalidation";
import { logAudit } from "@/lib/audit";
import {
  notificarMantencionProgramada,
  notificarMantencionCompletada,
} from "./notificaciones";

export async function getMantenciones(filters?: {
  equipoId?: string;
  tipoMantencion?: TipoMantencion;
  estadoMantencion?: EstadoMantencion;
  establecimiento?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}) {
  try {
    const where: any = {};

    if (filters?.equipoId) where.equipoId = filters.equipoId;
    if (filters?.tipoMantencion) where.tipoMantencion = filters.tipoMantencion;
    if (filters?.estadoMantencion)
      where.estadoMantencion = filters.estadoMantencion;

    if (filters?.establecimiento) {
      where.equipo = {
        ubicacion: {
          establecimiento: filters.establecimiento,
        },
      };
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fecha = {};
      if (filters.fechaDesde) where.fecha.gte = filters.fechaDesde;
      if (filters.fechaHasta) where.fecha.lte = filters.fechaHasta;
    }

    const mantenciones = await prisma.mantencion.findMany({
      where,
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        pauta: true,
        realizadoPor: true,
      },
      orderBy: { fecha: "desc" },
    });
    return mantenciones;
  } catch (error) {
    console.error("Error fetching mantenciones:", error);
    throw new Error("Failed to fetch mantenciones");
  }
}

export async function getMantencion(id: string) {
  try {
    const mantencion = await prisma.mantencion.findUnique({
      where: { id },
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        pauta: true,
        realizadoPor: true,
      },
    });
    return mantencion;
  } catch (error) {
    console.error("Error fetching mantencion:", error);
    throw new Error("Failed to fetch mantencion");
  }
}

export async function getScheduledMaintenances(month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const mantenciones = await prisma.mantencion.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        pauta: true,
      },
      orderBy: { fecha: "asc" },
    });
    return mantenciones;
  } catch (error) {
    console.error("Error fetching scheduled maintenances:", error);
    return [];
  }
}

export async function createMantencion(data: {
  fecha: Date;
  tipoMantencion: TipoMantencion;
  estadoResultante?: EstadoEquipo;
  estadoMantencion?: EstadoMantencion;
  observaciones?: string;
  equipoId: string;
  pautaId?: string;
  realizadoPorId?: string;
}) {
  try {
    const mantencion = await prisma.mantencion.create({
      data: {
        fecha: data.fecha,
        tipoMantencion: data.tipoMantencion,
        estadoResultante: data.estadoResultante ?? EstadoEquipo.OPERATIVO,
        estadoMantencion: data.estadoMantencion ?? EstadoMantencion.PENDIENTE,
        observaciones: data.observaciones,
        equipoId: data.equipoId,
        pautaId: data.pautaId,
        realizadoPorId: data.realizadoPorId,
      },
      include: {
        equipo: true,
      },
    });

    // Log de creación
    await logAudit({
      action: "CREATE",
      entity: "Mantencion",
      entityId: mantencion.id,
      entityName: `Mantención de ${mantencion.equipo.nombre}`,
      details: { tipo: data.tipoMantencion, fecha: data.fecha },
    });

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error creating mantencion:", error);
    throw new Error("Failed to create mantencion");
  }
}

export async function updateMantencion(
  id: string,
  data: Partial<{
    fecha: Date;
    tipoMantencion: TipoMantencion;
    estadoResultante: EstadoEquipo;
    estadoMantencion: EstadoMantencion;
    observaciones: string;
    pautaId: string | null;
    realizadoPorId: string | null;
  }>
) {
  try {
    const mantencion = await prisma.mantencion.update({
      where: { id },
      data,
      include: { equipo: true },
    });

    // Log de actualización
    await logAudit({
      action: "UPDATE",
      entity: "Mantencion",
      entityId: id,
      entityName: `Mantención de ${mantencion.equipo.nombre}`,
      details: data,
    });

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error updating mantencion:", error);
    throw new Error("Failed to update mantencion");
  }
}

// Asignar pauta a una mantención e inicializar respuestas del checklist
export async function asignarPautaAMantencion(
  mantencionId: string,
  pautaId: string
) {
  try {
    // Obtener los items de la pauta
    const pauta = await prisma.pautaMantenimiento.findUnique({
      where: { id: pautaId },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!pauta) {
      throw new Error("Pauta not found");
    }

    // Eliminar respuestas anteriores si las hay
    await prisma.mantencionChecklistResponse.deleteMany({
      where: { mantencionId },
    });

    // Actualizar la mantención con la nueva pauta y crear las respuestas
    const mantencion = await prisma.mantencion.update({
      where: { id: mantencionId },
      data: {
        pautaId,
        respuestas: {
          create: pauta.items.map((item) => ({
            pautaItemId: item.id,
            isCompleted: false,
          })),
        },
      },
      include: {
        pauta: {
          include: {
            items: true,
          },
        },
        respuestas: true,
      },
    });

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error asignando pauta a mantencion:", error);
    throw new Error("Failed to assign pauta to mantencion");
  }
}

export async function completeMantencion(
  id: string,
  userId: string,
  observaciones?: string
) {
  try {
    const mantencion = await prisma.mantencion.update({
      where: { id },
      data: {
        estadoMantencion: EstadoMantencion.COMPLETADA,
        realizadoPorId: userId,
        observaciones,
      },
      include: { equipo: true },
    });

    // Log de completar mantención
    await logAudit({
      action: "COMPLETE",
      entity: "Mantencion",
      entityId: id,
      entityName: `Mantención de ${mantencion.equipo.nombre}`,
    });

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error completing mantencion:", error);
    throw new Error("Failed to complete mantencion");
  }
}

export async function getAllMaintenancesForExport() {
  try {
    const mantenciones = await prisma.mantencion.findMany({
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        pauta: true,
        realizadoPor: true,
      },
      orderBy: { fecha: "desc" },
    });
    return mantenciones;
  } catch (error) {
    console.error("Error fetching all mantenciones:", error);
    throw new Error("Failed to fetch all mantenciones");
  }
}

// Función para agendar/programar una mantención
export async function scheduleMantencion(data: {
  fecha: string;
  equipoId: string;
  pautaId?: string;
  tipoMantencion?: TipoMantencion;
  observaciones?: string;
}) {
  try {
    // Corregir timezone: agregar T12:00:00 para evitar que se interprete como UTC medianoche
    const fechaCorregida = new Date(`${data.fecha}T12:00:00`);

    const mantencion = await prisma.mantencion.create({
      data: {
        fecha: fechaCorregida,
        tipoMantencion: data.tipoMantencion ?? TipoMantencion.PREVENTIVO,
        estadoResultante: EstadoEquipo.OPERATIVO,
        estadoMantencion: EstadoMantencion.PENDIENTE,
        observaciones: data.observaciones,
        equipoId: data.equipoId,
        pautaId: data.pautaId,
      },
      include: {
        equipo: {
          include: {
            ubicacion: true,
          },
        },
        pauta: true,
      },
    });

    // Log de agendar mantención
    await logAudit({
      action: "CREATE",
      entity: "Mantencion",
      entityId: mantencion.id,
      entityName: `Mantención programada: ${mantencion.equipo.nombre}`,
      details: { fecha: data.fecha, tipo: data.tipoMantencion || "PREVENTIVO" },
    });

    // Notificar que se programó una mantención
    await notificarMantencionProgramada(mantencion.id);

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error scheduling mantencion:", error);
    throw new Error("Failed to schedule mantencion");
  }
}

// Función para eliminar una mantención (con todas sus dependencias)
// forceDelete: true permite eliminar mantenciones completadas (solo para admins)
export async function deleteMantencion(
  id: string,
  forceDelete: boolean = false
) {
  try {
    // Obtener la mantención antes de eliminar para el log
    const mantencionInfo = await prisma.mantencion.findUnique({
      where: { id },
      include: { equipo: true },
    });

    if (!mantencionInfo) {
      throw new Error("Mantención no encontrada");
    }

    // Verificar si es una mantención completada y no tiene forceDelete
    if (mantencionInfo.estadoMantencion === "COMPLETADA" && !forceDelete) {
      throw new Error(
        "No se pueden eliminar mantenciones completadas. Se requiere permiso de administrador."
      );
    }

    // Eliminar en orden: primero dependencias, luego la mantención
    // 1. Eliminar notificaciones asociadas
    await prisma.notificacion.deleteMany({
      where: { mantencionId: id },
    });

    // 2. Eliminar firmas asociadas (MaintenanceSignature)
    await prisma.maintenanceSignature.deleteMany({
      where: { mantencionId: id },
    });

    // 3. Eliminar respuestas de checklist de pauta (MantencionChecklistResponse)
    await prisma.mantencionChecklistResponse.deleteMany({
      where: { mantencionId: id },
    });

    // 4. Eliminar checklist record si existe
    await prisma.checklistRecord.deleteMany({
      where: { mantencionId: id },
    });

    // 5. Eliminar la mantención
    await prisma.mantencion.delete({
      where: { id },
    });

    // Log de eliminación
    await logAudit({
      action: "DELETE",
      entity: "Mantencion",
      entityId: id,
      entityName: `Mantención de ${mantencionInfo.equipo.nombre}${
        forceDelete ? " (forzado por admin)" : ""
      }`,
      details: {
        estadoMantencion: mantencionInfo.estadoMantencion,
        forceDelete,
      },
    });

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error deleting mantencion:", error);
    throw new Error("Failed to delete mantencion");
  }
}

// Función para actualizar fecha de una mantención
export async function updateMantencionFecha(id: string, fecha: string) {
  try {
    // Corregir timezone: agregar T12:00:00 para evitar que se interprete como UTC medianoche
    const fechaCorregida = new Date(`${fecha}T12:00:00`);

    const mantencion = await prisma.mantencion.update({
      where: { id },
      data: {
        fecha: fechaCorregida,
      },
      include: { equipo: true }, // Include equipo to get equipoId for revalidation
    });

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error updating mantencion fecha:", error);
    throw new Error("Failed to update mantencion fecha");
  }
}

// ==================== MANTENCIONES CON CHECKLIST ====================

// Obtener una mantención completa con todos sus datos
export async function getMantencionCompleta(id: string) {
  try {
    const mantencion = await prisma.mantencion.findUnique({
      where: { id },
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        pauta: {
          include: {
            items: {
              orderBy: { order: "asc" },
            },
          },
        },
        realizadoPor: true,
        createdBy: true,
        updatedBy: true,
        respuestas: {
          include: {
            pautaItem: true,
          },
          orderBy: {
            pautaItem: {
              order: "asc",
            },
          },
        },
        firmas: {
          include: {
            user: true,
          },
        },
      },
    });
    return mantencion;
  } catch (error) {
    console.error("Error fetching mantencion completa:", error);
    throw new Error("Failed to fetch mantencion completa");
  }
}

// Crear mantención con checklist inicializado desde una pauta
export async function createMantencionConChecklist(data: {
  fecha: Date;
  equipoId: string;
  pautaId: string;
  tipoMantencion?: TipoMantencion;
  equiposDePrueba?: string;
  observaciones?: string;
  createdById?: string;
}) {
  try {
    // Obtener los items de la pauta
    const pauta = await prisma.pautaMantenimiento.findUnique({
      where: { id: data.pautaId },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!pauta) {
      throw new Error("Pauta not found");
    }

    // Crear la mantención con las respuestas del checklist inicializadas
    const mantencion = await prisma.mantencion.create({
      data: {
        fecha: data.fecha,
        tipoMantencion: data.tipoMantencion ?? pauta.tipoMantencion,
        estadoResultante: EstadoEquipo.OPERATIVO,
        estadoMantencion: EstadoMantencion.EN_PROCESO,
        equiposDePrueba: data.equiposDePrueba,
        observaciones: data.observaciones,
        equipoId: data.equipoId,
        pautaId: data.pautaId,
        createdById: data.createdById,
        respuestas: {
          create: pauta.items.map((item) => ({
            pautaItemId: item.id,
            isCompleted: false,
          })),
        },
      },
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        pauta: {
          include: {
            items: {
              orderBy: { order: "asc" },
            },
          },
        },
        respuestas: {
          include: {
            pautaItem: true,
          },
        },
      },
    });

    await revalidateGlobal();
    return mantencion;
  } catch (error) {
    console.error("Error creating mantencion con checklist:", error);
    throw new Error("Failed to create mantencion con checklist");
  }
}

// Actualizar una respuesta del checklist
export async function updateChecklistResponse(
  mantencionId: string,
  pautaItemId: string,
  data: {
    isCompleted?: boolean;
    comment?: string;
  }
) {
  try {
    const response = await prisma.mantencionChecklistResponse.upsert({
      where: {
        mantencionId_pautaItemId: {
          mantencionId,
          pautaItemId,
        },
      },
      update: data,
      create: {
        mantencionId,
        pautaItemId,
        isCompleted: data.isCompleted ?? false,
        comment: data.comment,
      },
    });

    // We might not want to revalidate the whole page for a single checkbox as it could be slow,
    // but the user requested automatic updates.
    // For checklist interactions, usually client state is enough, but to ensure consistency:
    await revalidateGlobal();

    return response;
  } catch (error) {
    console.error("Error updating checklist response:", error);
    throw new Error("Failed to update checklist response");
  }
}

// Actualizar múltiples respuestas del checklist a la vez
export async function updateMultipleChecklistResponses(
  mantencionId: string,
  responses: Array<{
    pautaItemId: string;
    isCompleted: boolean;
    comment?: string;
  }>
) {
  try {
    await prisma.$transaction(
      responses.map((r) =>
        prisma.mantencionChecklistResponse.upsert({
          where: {
            mantencionId_pautaItemId: {
              mantencionId,
              pautaItemId: r.pautaItemId,
            },
          },
          update: {
            isCompleted: r.isCompleted,
            comment: r.comment,
          },
          create: {
            mantencionId,
            pautaItemId: r.pautaItemId,
            isCompleted: r.isCompleted,
            comment: r.comment,
          },
        })
      )
    );

    await revalidateGlobal();

    return { success: true };
  } catch (error) {
    console.error("Error updating multiple checklist responses:", error);
    throw new Error("Failed to update multiple checklist responses");
  }
}

// Completar una mantención (marcar como completada)
export async function finalizarMantencion(
  id: string,
  data: {
    estadoResultante: EstadoEquipo;
    observaciones?: string;
    updatedById?: string;
  }
) {
  try {
    const mantencion = await prisma.mantencion.update({
      where: { id },
      data: {
        estadoMantencion: EstadoMantencion.COMPLETADA,
        estadoResultante: data.estadoResultante,
        observaciones: data.observaciones,
        completadaEn: new Date(),
        updatedById: data.updatedById,
      },
      include: { equipo: true },
    });

    await revalidateGlobal();

    return mantencion;
  } catch (error) {
    console.error("Error finalizando mantencion:", error);
    throw new Error("Failed to finalize mantencion");
  }
}

// Cancelar una mantención
export async function cancelarMantencion(id: string, motivo?: string) {
  try {
    const mantencion = await prisma.mantencion.update({
      where: { id },
      data: {
        estadoMantencion: EstadoMantencion.CANCELADA,
        observaciones: motivo,
      },
      include: { equipo: true },
    });

    await revalidateGlobal();

    return mantencion;
  } catch (error) {
    console.error("Error cancelando mantencion:", error);
    throw new Error("Failed to cancel mantencion");
  }
}

// Obtener mantenciones pendientes de firma
export async function getMantencionesPendientesFirma() {
  try {
    const mantenciones = await prisma.mantencion.findMany({
      where: {
        estadoMantencion: EstadoMantencion.COMPLETADA,
        firmas: {
          none: {},
        },
      },
      include: {
        equipo: {
          include: {
            ubicacion: true,
          },
        },
        pauta: true,
      },
      orderBy: { fecha: "desc" },
    });

    return mantenciones;
  } catch (error) {
    console.error("Error fetching mantenciones pendientes firma:", error);
    throw new Error("Failed to fetch mantenciones pendientes firma");
  }
}
