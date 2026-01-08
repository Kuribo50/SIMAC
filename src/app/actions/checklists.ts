"use server";

import prisma from "@/lib/prisma";
import { revalidateGlobal } from "@/lib/revalidation";

// ==================== CHECKLIST TEMPLATES ====================

export async function getChecklistTemplates() {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { isActive: true },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Failed to fetch templates");
  }
}

export async function getChecklistTemplate(id: string) {
  try {
    const template = await prisma.checklistTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });
    return template;
  } catch (error) {
    console.error("Error fetching template:", error);
    throw new Error("Failed to fetch template");
  }
}

// ==================== CHECKLIST RECORDS ====================

export async function createChecklistRecord(data: {
  equipoId: string | number;
  templateId: string | number;
  maintenanceType?: string;
  tipoMantencion?: string;
  technicianName?: string;
  tecnicoNombre?: string;
  observations?: string;
  observaciones?: string;
  userId?: string;
  responsableNombre?: string;
  fecha?: string;
  fechaProximaMantencion?: string | null;
  items?: Array<{
    itemTemplateId: number | string;
    completado: boolean;
  }>;
  responses?: Array<{
    itemId: string;
    isCompleted: boolean;
    comment?: string;
  }>;
}) {
  try {
    // Map field names
    const maintenanceType =
      data.maintenanceType || data.tipoMantencion || "preventiva";
    const technicianName = data.technicianName || data.tecnicoNombre;
    const observations = data.observations || data.observaciones;

    const record = await prisma.checklistRecord.create({
      data: {
        equipoId: String(data.equipoId),
        templateId: String(data.templateId),
        maintenanceType: maintenanceType,
        technicianName: technicianName,
        observations: observations,
        status: "en_proceso",
        userId: data.userId,
        responses: {
          create:
            data.responses?.map((r) => ({
              itemId: r.itemId,
              isCompleted: r.isCompleted,
              comment: r.comment,
            })) || [],
        },
      },
    });
    await revalidateGlobal();
    return record;
  } catch (error) {
    console.error("Error creating record:", error);
    throw new Error("Failed to create record");
  }
}

export async function getChecklistRecord(id: string) {
  try {
    const record = await prisma.checklistRecord.findUnique({
      where: { id },
      include: {
        equipo: {
          include: {
            ubicacion: true,
            tipoEquipo: true,
          },
        },
        template: {
          include: {
            items: {
              orderBy: { order: "asc" },
            },
          },
        },
        responses: {
          include: {
            item: true,
          },
        },
        user: true,
      },
    });
    return record;
  } catch (error) {
    console.error("Error fetching record:", error);
    throw new Error("Failed to fetch record");
  }
}

export async function getHistorialMantenciones(equipoId?: string) {
  try {
    const where: any = {};
    if (equipoId) where.equipoId = equipoId;

    // Obtener mantenciones del modelo Mantencion
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
        respuestas: true,
        firmas: true,
      },
      orderBy: { fecha: "desc" },
    });

    // Transformar a formato compatible con la UI
    const records = mantenciones.map((m) => ({
      id: m.id,
      createdAt: m.fecha,
      status:
        m.estadoMantencion === "COMPLETADA"
          ? "completado"
          : m.estadoMantencion === "CANCELADA"
          ? "anulado"
          : "pendiente",
      maintenanceType: m.tipoMantencion,
      technicianName: m.realizadoPor?.name || null,
      observations: m.observaciones,
      equipo: m.equipo
        ? {
            id: m.equipo.id,
            nombre: m.equipo.nombre,
            modelo: m.equipo.modelo,
            serie: m.equipo.serie,
            ubicacion: m.equipo.ubicacion,
          }
        : null,
      template: m.pauta
        ? {
            id: m.pauta.id,
            name: m.pauta.nombre,
          }
        : null,
      responses: m.respuestas,
    }));

    return records;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw new Error("Failed to fetch history");
  }
}

export async function updateChecklistRecord(
  id: string,
  data: {
    observations?: string;
    observaciones?: string;
    technicianName?: string;
    tecnicoNombre?: string;
    tecnicoRut?: string;
    fecha?: string;
    items?: any[];
    responses?: Array<{
      itemId: string;
      isCompleted: boolean;
      comment?: string;
    }>;
  }
) {
  try {
    // Map Spanish field names to English
    const mappedData = {
      observations: data.observations || data.observaciones,
      technicianName: data.technicianName || data.tecnicoNombre,
    };

    const totalResponses = data.responses?.length || 0;
    const completedResponses =
      data.responses?.filter((r) => r.isCompleted).length || 0;
    const status =
      completedResponses === totalResponses && totalResponses > 0
        ? "completado"
        : "en_proceso";

    const record = await prisma.checklistRecord.update({
      where: { id },
      data: {
        observations: mappedData.observations,
        technicianName: mappedData.technicianName,
        status,
        responses: {
          deleteMany: {},
          create:
            data.responses?.map((r) => ({
              itemId: r.itemId,
              isCompleted: r.isCompleted,
              comment: r.comment,
            })) || [],
        },
      },
    });
    await revalidateGlobal();
    return record;
  } catch (error) {
    console.error("Error updating record:", error);
    throw new Error("Failed to update record");
  }
}

export async function deleteChecklistRecord(id: string) {
  try {
    await prisma.checklistRecord.delete({
      where: { id },
    });
    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error deleting record:", error);
    throw new Error("Failed to delete record");
  }
}

export async function closeChecklistRecord(id: string) {
  try {
    const record = await prisma.checklistRecord.update({
      where: { id },
      data: {
        status: "completado",
        closedAt: new Date(),
      },
    });
    await revalidateGlobal();
    return record;
  } catch (error) {
    console.error("Error closing record:", error);
    throw new Error("Failed to close record");
  }
}

export async function signChecklistRecord(
  id: number | string,
  nombre: string,
  rut: string
) {
  try {
    const record = await prisma.checklistRecord.update({
      where: { id: String(id) },
      data: {
        technicianName: `${nombre} (RUT: ${rut})`,
        status: "completado",
        closedAt: new Date(),
      },
    });
    await revalidateGlobal();
    return record;
  } catch (error) {
    console.error("Error signing record:", error);
    throw new Error("Failed to sign record");
  }
}
