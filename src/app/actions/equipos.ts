"use server";

import prisma from "../../lib/prisma";
import { EstadoEquipo } from "@prisma/client";
import { logAudit } from "@/lib/audit";
import { revalidateGlobal } from "@/lib/revalidation";

export async function getEquipos(filters?: {
  search?: string;
  ubicacionId?: string;
  tipoEquipoId?: string;
  estado?: EstadoEquipo;
  establecimiento?: string;
}) {
  try {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { nombre: { contains: filters.search } },
        { modelo: { contains: filters.search } },
        { serie: { contains: filters.search } },
      ];
    }

    if (filters?.ubicacionId) {
      where.ubicacionId = filters.ubicacionId;
    }

    if (filters?.tipoEquipoId) {
      where.tipoEquipoId = filters.tipoEquipoId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.establecimiento) {
      where.ubicacion = {
        establecimiento: filters.establecimiento,
      };
    }

    const equipos = await prisma.equipo.findMany({
      where,
      include: {
        ubicacion: true,
        tipoEquipo: true,
        pautaAsignada: {
          select: {
            id: true,
            nombre: true,
            periodicidadBase: true,
          },
        },
        mantenciones: {
          orderBy: { fecha: "desc" },
          take: 3,
          select: {
            id: true,
            fecha: true,
            tipoMantencion: true,
            estadoMantencion: true,
          },
        },
      },
      orderBy: [{ nombre: "asc" }],
    });
    return equipos;
  } catch (error) {
    console.error("Error fetching equipos:", error);
    throw new Error("Failed to fetch equipos");
  }
}

export async function getEquipo(id: string) {
  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        ubicacion: true,
        tipoEquipo: true,
        pautaAsignada: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
        mantenciones: {
          include: {
            pauta: true,
            realizadoPor: true,
          },
          orderBy: { fecha: "desc" },
        },
        checklistRecords: {
          include: {
            template: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return equipo;
  } catch (error) {
    console.error("Error fetching equipo:", error);
    throw new Error("Failed to fetch equipo");
  }
}

export async function createEquipo(data: {
  nombre: string;
  tipo?: string;
  ubicacion?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  imagenUrl?: string;
  esCritico?: boolean;
  ubicacionId?: string;
  tipoEquipoId?: string;
  imageUrl?: string;
  estado?: EstadoEquipo;
}) {
  try {
    // Buscar o crear el tipo de equipo y ubicación si es necesario
    let tipoEquipoId = data.tipoEquipoId;
    let ubicacionId = data.ubicacionId;

    // Si el tipo viene como string simple, usar como identificador
    if (data.tipo && !tipoEquipoId) {
      // Para esta versión, usaremos el tipo como ID temporalmente
      // Idealmente deberías tener una tabla de tipos de equipo
      tipoEquipoId = data.tipo.toUpperCase();
    }

    // Si la ubicación viene como string simple, usar como identificador
    if (data.ubicacion && !ubicacionId) {
      // Para esta versión, usaremos la ubicación como ID temporalmente
      ubicacionId = data.ubicacion;
    }

    const equipo = await prisma.equipo.create({
      data: {
        nombre: data.nombre,
        modelo: data.modelo || "",
        serie: data.serie || "",
        estado: data.estado ?? EstadoEquipo.OPERATIVO,
        ubicacionId: ubicacionId || "",
        tipoEquipoId: tipoEquipoId || "OTROS",
        imageUrl: data.imagenUrl || data.imageUrl,
        marca: data.marca || "",
        esCritico: data.esCritico || false,
        inventario: (data as any).inventario || "", // Cast to any to avoid type error if inventario missing in type
      },
    });

    // Log de creación
    await logAudit({
      action: "CREATE",
      entity: "Equipo",
      entityId: equipo.id,
      entityName: equipo.nombre,
      details: { modelo: data.modelo, serie: data.serie },
    });

    await revalidateGlobal();
    return equipo;
  } catch (error) {
    console.error("Error creating equipo:", error);
    throw new Error("Failed to create equipo");
  }
}

export async function updateEquipo(
  id: string,
  data: Partial<{
    nombre: string;
    modelo: string;
    serie: string;
    marca: string;
    inventario: string;
    estado: EstadoEquipo;
    ubicacionId: string;
    tipoEquipoId: string;
    imageUrl: string;
    esCritico: boolean;
  }>
) {
  try {
    const equipo = await prisma.equipo.update({
      where: { id },
      data: data,
    });

    // Log de actualización
    await logAudit({
      action: "UPDATE",
      entity: "Equipo",
      entityId: id,
      entityName: equipo.nombre,
      details: data,
    });

    await revalidateGlobal();

    return equipo;
  } catch (error) {
    console.error("Error updating equipo:", error);
    throw new Error("Failed to update equipo");
  }
}

export async function deleteEquipo(id: string) {
  try {
    // Obtener info del equipo antes de eliminar
    const equipoInfo = await prisma.equipo.findUnique({ where: { id } });

    // Primero verificar si tiene mantenciones asociadas
    const mantenciones = await prisma.mantencion.count({
      where: { equipoId: id },
    });

    if (mantenciones > 0) {
      throw new Error(
        `No se puede eliminar el equipo porque tiene ${mantenciones} mantenciones asociadas`
      );
    }

    await prisma.equipo.delete({
      where: { id },
    });

    // Log de eliminación
    await logAudit({
      action: "DELETE",
      entity: "Equipo",
      entityId: id,
      entityName: equipoInfo?.nombre || id,
    });

    await revalidateGlobal();
    return { success: true };
  } catch (error) {
    console.error("Error deleting equipo:", error);
    throw error;
  }
}

export async function asignarPautaAEquipo(
  equipoId: string,
  pautaId: string | null
) {
  try {
    const equipo = await prisma.equipo.update({
      where: { id: equipoId },
      data: { pautaAsignadaId: pautaId },
      include: {
        pautaAsignada: true,
      },
    });

    // Log de asignación de pauta
    await logAudit({
      action: "UPDATE",
      entity: "Equipo",
      entityId: equipoId,
      entityName: equipo.nombre,
      details: {
        accion: pautaId ? "Pauta asignada" : "Pauta desasignada",
        pautaId: pautaId,
        pautaNombre: equipo.pautaAsignada?.nombre || null,
      },
    });

    await revalidateGlobal();
    return equipo;
  } catch (error) {
    console.error("Error asignando pauta a equipo:", error);
    throw new Error("Error al asignar pauta al equipo");
  }
}
