"use server";

import prisma from "@/lib/prisma";
import { Periodicidad, TipoMantencion, TipoPauta } from "@prisma/client";
import { revalidateGlobal } from "@/lib/revalidation";
import { logAudit } from "@/lib/audit";

// ==================== PAUTAS ====================

export async function getPautas() {
  try {
    const pautas = await prisma.pautaMantenimiento.findMany({
      include: {
        _count: {
          select: { mantenciones: true, items: true },
        },
        tipoEquipo: true,
      },
      orderBy: { nombre: "asc" },
    });
    return pautas;
  } catch (error) {
    console.error("Error fetching pautas:", error);
    throw new Error("Failed to fetch pautas");
  }
}

export async function getPautasActivas() {
  try {
    const pautas = await prisma.pautaMantenimiento.findMany({
      where: { activo: true },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
        tipoEquipo: true,
      },
      orderBy: { nombre: "asc" },
    });
    return pautas;
  } catch (error) {
    console.error("Error fetching pautas activas:", error);
    throw new Error("Failed to fetch pautas activas");
  }
}

export async function getPauta(id: string) {
  try {
    const pauta = await prisma.pautaMantenimiento.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
        tipoEquipo: true,
        mantenciones: {
          include: {
            equipo: {
              include: {
                ubicacion: true,
                tipoEquipo: true,
              },
            },
            realizadoPor: true,
            firmas: true,
          },
          orderBy: { fecha: "desc" },
          take: 20,
        },
      },
    });
    return pauta;
  } catch (error) {
    console.error("Error fetching pauta:", error);
    throw new Error("Failed to fetch pauta");
  }
}

export async function createPauta(data: {
  codigo: string;
  nombre: string;
  descripcion?: string;
  periodicidadBase: Periodicidad;
  tipoMantencion?: TipoMantencion;
  areaAdministrativa?: string;
  tipoEquipoId?: string;
  tipo?: TipoPauta;
  items?: Array<{ description: string; isRequired: boolean }>;
}) {
  try {
    const pauta = await prisma.pautaMantenimiento.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        periodicidadBase: data.periodicidadBase,
        tipoMantencion: data.tipoMantencion || TipoMantencion.PREVENTIVO,
        tipo: data.tipo || "EQUIPAMIENTO",
        areaAdministrativa: data.areaAdministrativa,
        tipoEquipoId: data.tipoEquipoId,
        items: data.items
          ? {
              create: data.items.map((item, index) => ({
                order: index + 1,
                description: item.description,
                isRequired: item.isRequired,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
      },
    });
    await revalidateGlobal();
    return pauta;
  } catch (error) {
    console.error("Error creating pauta:", error);
    throw new Error("Failed to create pauta");
  }
}

export async function updatePauta(
  id: string,
  data: {
    codigo?: string;
    nombre?: string;
    descripcion?: string;
    periodicidadBase?: Periodicidad;
    tipoMantencion?: TipoMantencion;
    areaAdministrativa?: string;
    tipoEquipoId?: string | null;
    tipo?: TipoPauta;
    activo?: boolean;
  }
) {
  try {
    const pauta = await prisma.pautaMantenimiento.update({
      where: { id },
      data,
    });
    await revalidateGlobal();
    return pauta;
  } catch (error) {
    console.error("Error updating pauta:", error);
    throw new Error("Failed to update pauta");
  }
}

export async function deletePauta(
  id: string,
  forceDelete: boolean = false
): Promise<{
  success: boolean;
  requiresConfirmation?: boolean;
  mantencionesCount?: number;
  equiposCount?: number;
  hasResponses?: boolean;
  message?: string;
  cannotDelete?: boolean;
  pautaNombre?: string;
}> {
  try {
    // Verificar si tiene mantenciones, equipos asignados y respuestas de checklist
    const pauta = await prisma.pautaMantenimiento.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mantenciones: true,
            equiposAsignados: true,
          },
        },
        items: {
          include: {
            _count: {
              select: { respuestas: true },
            },
          },
        },
      },
    });

    if (!pauta) {
      throw new Error("Pauta no encontrada");
    }

    // Verificar si hay respuestas de checklist asociadas a los items
    const hasResponses = pauta.items.some((item) => item._count.respuestas > 0);

    // Si hay respuestas de checklist, NO se puede eliminar - marcar como inactiva
    if (hasResponses) {
      // Marcar la pauta como inactiva en lugar de eliminarla
      await prisma.pautaMantenimiento.update({
        where: { id },
        data: { activo: false },
      });

      // Log de auditoría
      await logAudit({
        action: "UPDATE",
        entity: "Pauta",
        entityId: id,
        entityName: `${pauta.codigo} - ${pauta.nombre}`,
        details: {
          codigo: pauta.codigo,
          nombre: pauta.nombre,
          accion: "Marcada como inactiva (tiene respuestas de mantenciones)",
          mantencionesAsociadas: pauta._count.mantenciones,
        },
      });

      await revalidateGlobal();
      return {
        success: true,
        cannotDelete: true,
        pautaNombre: pauta.nombre,
        message: `La pauta "${pauta.nombre}" está en uso (tiene ${pauta._count.mantenciones} mantención(es) con respuestas registradas). Se ha marcado como INACTIVA en lugar de eliminarse para preservar el historial.`,
      };
    }

    // Si tiene mantenciones o equipos asignados pero sin respuestas
    const totalRelations =
      pauta._count.mantenciones + pauta._count.equiposAsignados;
    if (totalRelations > 0 && !forceDelete) {
      return {
        success: false,
        requiresConfirmation: true,
        mantencionesCount: pauta._count.mantenciones,
        equiposCount: pauta._count.equiposAsignados,
        message: `Esta pauta tiene ${pauta._count.mantenciones} mantención(es) y ${pauta._count.equiposAsignados} equipo(s) asignado(s). ¿Desea desasociarlos y eliminar la pauta?`,
      };
    }

    // Si hay relaciones y se forzó la eliminación, desasociar primero
    if (forceDelete) {
      // Desasociar mantenciones
      if (pauta._count.mantenciones > 0) {
        await prisma.mantencion.updateMany({
          where: { pautaId: id },
          data: { pautaId: null },
        });
      }

      // Desasociar equipos
      if (pauta._count.equiposAsignados > 0) {
        await prisma.equipo.updateMany({
          where: { pautaAsignadaId: id },
          data: { pautaAsignadaId: null },
        });
      }
    }

    const pautaNombre = pauta.nombre;
    const pautaCodigo = pauta.codigo;

    // Eliminar items primero (la relación tiene onDelete: Cascade)
    await prisma.pautaItem.deleteMany({
      where: { pautaId: id },
    });

    // Eliminar la pauta
    await prisma.pautaMantenimiento.delete({
      where: { id },
    });

    // Log de auditoría
    await logAudit({
      action: "DELETE",
      entity: "Pauta",
      entityId: id,
      entityName: `${pautaCodigo} - ${pautaNombre}`,
      details: {
        codigo: pautaCodigo,
        nombre: pautaNombre,
        mantencionesDesasociadas: forceDelete ? pauta._count.mantenciones : 0,
        equiposDesasociados: forceDelete ? pauta._count.equiposAsignados : 0,
      },
    });

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error deleting pauta:", error);
    throw error;
  }
}

export async function togglePautaActivo(id: string) {
  try {
    const pauta = await prisma.pautaMantenimiento.findUnique({
      where: { id },
      select: { activo: true },
    });

    if (!pauta) throw new Error("Pauta not found");

    const updated = await prisma.pautaMantenimiento.update({
      where: { id },
      data: { activo: !pauta.activo },
    });

    await revalidateGlobal();
    return updated;
  } catch (error) {
    console.error("Error toggling pauta activo:", error);
    throw new Error("Failed to toggle pauta activo");
  }
}

// ==================== PAUTA ITEMS ====================

export async function getPautaItems(pautaId: string) {
  try {
    const items = await prisma.pautaItem.findMany({
      where: { pautaId },
      orderBy: { order: "asc" },
    });
    return items;
  } catch (error) {
    console.error("Error fetching pauta items:", error);
    throw new Error("Failed to fetch pauta items");
  }
}

export async function createPautaItem(data: {
  pautaId: string;
  description: string;
  isRequired?: boolean;
}) {
  try {
    const maxOrder = await prisma.pautaItem.findFirst({
      where: { pautaId: data.pautaId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const item = await prisma.pautaItem.create({
      data: {
        pautaId: data.pautaId,
        description: data.description,
        isRequired: data.isRequired ?? true,
        order: (maxOrder?.order ?? 0) + 1,
      },
    });

    await revalidateGlobal();
    return item;
  } catch (error) {
    console.error("Error creating pauta item:", error);
    throw new Error("Failed to create pauta item");
  }
}

export async function updatePautaItem(
  id: string,
  data: {
    description?: string;
    isRequired?: boolean;
  }
) {
  try {
    const item = await prisma.pautaItem.update({
      where: { id },
      data,
    });
    await revalidateGlobal();
    return item;
  } catch (error) {
    console.error("Error updating pauta item:", error);
    throw new Error("Failed to update pauta item");
  }
}

export async function deletePautaItem(id: string) {
  try {
    const item = await prisma.pautaItem.findUnique({
      where: { id },
      select: { pautaId: true, order: true },
    });

    if (!item) throw new Error("Item not found");

    await prisma.pautaItem.delete({ where: { id } });

    await prisma.pautaItem.updateMany({
      where: {
        pautaId: item.pautaId,
        order: { gt: item.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error deleting pauta item:", error);
    throw new Error("Failed to delete pauta item");
  }
}

export async function movePautaItem(id: string, direction: "up" | "down") {
  try {
    const item = await prisma.pautaItem.findUnique({ where: { id } });
    if (!item) throw new Error("Item not found");

    const targetOrder = direction === "up" ? item.order - 1 : item.order + 1;

    const targetItem = await prisma.pautaItem.findFirst({
      where: { pautaId: item.pautaId, order: targetOrder },
    });

    if (!targetItem)
      return { success: false, message: "No se puede mover más" };

    await prisma.$transaction([
      prisma.pautaItem.update({
        where: { id: item.id },
        data: { order: targetOrder },
      }),
      prisma.pautaItem.update({
        where: { id: targetItem.id },
        data: { order: item.order },
      }),
    ]);

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error moving pauta item:", error);
    throw new Error("Failed to move pauta item");
  }
}

// ==================== BULK OPERATIONS ====================

export async function updatePautaItems(
  pautaId: string,
  items: Array<{
    id?: string;
    description: string;
    isRequired: boolean;
    order: number;
  }>
) {
  try {
    // Obtener items actuales
    const existingItems = await prisma.pautaItem.findMany({
      where: { pautaId },
      select: { id: true },
    });
    const existingIds = new Set(existingItems.map((i) => i.id));

    // Separar items nuevos de existentes
    const itemsToUpdate = items.filter(
      (item) => item.id && existingIds.has(item.id)
    );
    const itemsToCreate = items.filter(
      (item) => !item.id || !existingIds.has(item.id)
    );
    const idsToKeep = new Set(
      items.filter((item) => item.id).map((item) => item.id)
    );
    const idsToDelete = [...existingIds].filter((id) => !idsToKeep.has(id));

    // Ejecutar operaciones en transacción
    await prisma.$transaction([
      // Eliminar items que ya no existen
      ...idsToDelete.map((id) => prisma.pautaItem.delete({ where: { id } })),
      // Actualizar items existentes
      ...itemsToUpdate.map((item) =>
        prisma.pautaItem.update({
          where: { id: item.id! },
          data: {
            description: item.description,
            isRequired: item.isRequired,
            order: item.order,
          },
        })
      ),
      // Crear items nuevos
      ...itemsToCreate.map((item) =>
        prisma.pautaItem.create({
          data: {
            pautaId,
            description: item.description,
            isRequired: item.isRequired,
            order: item.order,
          },
        })
      ),
    ]);

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error updating pauta items:", error);
    throw new Error("Failed to update pauta items");
  }
}

export async function createPautaWithItems(data: {
  codigo: string;
  nombre: string;
  descripcion?: string;
  periodicidadBase: Periodicidad;
  tipoMantencion?: TipoMantencion;
  tipo?: TipoPauta;
  areaAdministrativa?: string;
  tipoEquipoId?: string;
  items: Array<{ description: string; isRequired?: boolean }>;
}) {
  try {
    const pauta = await prisma.pautaMantenimiento.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        periodicidadBase: data.periodicidadBase,
        tipoMantencion: data.tipoMantencion || TipoMantencion.PREVENTIVO,
        tipo: data.tipo || "EQUIPAMIENTO",
        areaAdministrativa: data.areaAdministrativa,
        tipoEquipoId: data.tipoEquipoId,
        items: {
          create: data.items.map((item, index) => ({
            order: index + 1,
            description: item.description,
            isRequired: item.isRequired ?? true,
          })),
        },
      },
      include: { items: true },
    });

    await revalidateGlobal();
    return pauta;
  } catch (error) {
    console.error("Error creating pauta with items:", error);
    throw new Error("Failed to create pauta with items");
  }
}
