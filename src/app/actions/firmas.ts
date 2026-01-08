"use server";

import prisma from "@/lib/prisma";
import { RolFirma } from "@prisma/client";
import { revalidateGlobal } from "@/lib/revalidation";
import { logAudit } from "@/lib/audit";
import { notificarFirma } from "./notificaciones";

// ==================== FIRMAS ====================

export async function getSignatures(mantencionId: string) {
  try {
    const firmas = await prisma.maintenanceSignature.findMany({
      where: { mantencionId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { firmadoEn: "asc" },
    });
    return firmas;
  } catch (error) {
    console.error("Error fetching signatures:", error);
    throw new Error("Failed to fetch signatures");
  }
}

export async function getSignature(mantencionId: string, role: RolFirma) {
  try {
    const firma = await prisma.maintenanceSignature.findUnique({
      where: {
        mantencionId_role: {
          mantencionId,
          role,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return firma;
  } catch (error) {
    console.error("Error fetching signature:", error);
    throw new Error("Failed to fetch signature");
  }
}

export async function createSignature(data: {
  mantencionId: string;
  role: RolFirma;
  nombreFirmante: string;
  rutFirmante?: string;
  cargoFirmante?: string;
  firmaImagen: string; // Base64 de la firma
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    // Verificar si ya existe una firma para este rol
    const existing = await prisma.maintenanceSignature.findUnique({
      where: {
        mantencionId_role: {
          mantencionId: data.mantencionId,
          role: data.role,
        },
      },
    });

    if (existing) {
      // Actualizar la firma existente (sobrescribir)
      const firma = await prisma.maintenanceSignature.update({
        where: { id: existing.id },
        data: {
          nombreFirmante: data.nombreFirmante,
          rutFirmante: data.rutFirmante,
          cargoFirmante: data.cargoFirmante,
          firmaImagen: data.firmaImagen,
          userId: data.userId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          firmadoEn: new Date(),
        },
      });

      await revalidateGlobal();
      return firma;
    }

    // Crear nueva firma
    const dataObj: any = {
      mantencion: {
        connect: { id: data.mantencionId },
      },
      role: data.role,
      nombreFirmante: data.nombreFirmante,
      firmaImagen: data.firmaImagen,
    };

    if (data.rutFirmante !== undefined) dataObj.rutFirmante = data.rutFirmante;
    if (data.cargoFirmante !== undefined)
      dataObj.cargoFirmante = data.cargoFirmante;
    if (data.userId !== undefined) dataObj.userId = data.userId;
    if (data.ipAddress !== undefined) dataObj.ipAddress = data.ipAddress;
    if (data.userAgent !== undefined) dataObj.userAgent = data.userAgent;

    const firma = await prisma.maintenanceSignature.create({
      data: dataObj,
    });

    // Log de firma
    await logAudit({
      action: "SIGN",
      entity: "Firma",
      entityId: firma.id,
      entityName: `Firma ${data.role} - ${data.nombreFirmante}`,
      details: { mantencionId: data.mantencionId, rol: data.role },
    });

    // Notificar la firma
    await notificarFirma(data.mantencionId, data.role, data.nombreFirmante);

    await revalidateGlobal();
    return firma;
  } catch (error) {
    console.error("Error creating signature:", error);
    throw new Error("Failed to create signature");
  }
}

export async function deleteSignature(mantencionId: string, role: RolFirma) {
  try {
    await prisma.maintenanceSignature.delete({
      where: {
        mantencionId_role: {
          mantencionId,
          role,
        },
      },
    });

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error deleting signature:", error);
    throw new Error("Failed to delete signature");
  }
}

// Verificar si una mantención tiene todas las firmas requeridas
export async function hasRequiredSignatures(mantencionId: string) {
  try {
    const signatures = await prisma.maintenanceSignature.findMany({
      where: { mantencionId },
      select: { role: true },
    });

    const roles = signatures.map((s) => s.role);
    const hasTecnico = roles.includes(RolFirma.TECNICO);
    const hasResponsable = roles.includes(RolFirma.RESPONSABLE);

    return {
      hasTecnico,
      hasResponsable,
      isComplete: hasTecnico && hasResponsable,
    };
  } catch (error) {
    console.error("Error checking signatures:", error);
    throw new Error("Failed to check signatures");
  }
}
