"use server";

import prisma from "../../lib/prisma";

export async function getUbicaciones() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      include: {
        equipos: true,
        _count: {
          select: { equipos: true },
        },
      },
      orderBy: [{ establecimiento: "asc" }, { area: "asc" }],
    });
    return ubicaciones;
  } catch (error) {
    console.error("Error fetching ubicaciones:", error);
    throw new Error("Failed to fetch ubicaciones");
  }
}

export async function getUbicacionesPorEstablecimiento() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      include: {
        _count: {
          select: { equipos: true },
        },
      },
      orderBy: [{ establecimiento: "asc" }, { area: "asc" }],
    });

    // Agrupar por establecimiento
    const agrupadas = ubicaciones.reduce((acc, ub) => {
      if (!acc[ub.establecimiento]) {
        acc[ub.establecimiento] = [];
      }
      acc[ub.establecimiento].push(ub);
      return acc;
    }, {} as Record<string, typeof ubicaciones>);

    return agrupadas;
  } catch (error) {
    console.error("Error fetching ubicaciones:", error);
    throw new Error("Failed to fetch ubicaciones");
  }
}

export async function getUbicacion(id: string) {
  try {
    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id },
      include: {
        equipos: {
          include: {
            tipoEquipo: true,
            mantenciones: {
              orderBy: { fecha: "desc" },
              take: 1,
            },
          },
        },
      },
    });
    return ubicacion;
  } catch (error) {
    console.error("Error fetching ubicacion:", error);
    throw new Error("Failed to fetch ubicacion");
  }
}

export async function createUbicacion(data: {
  establecimiento: string;
  area: string;
  descripcion?: string;
  // Campos del área
  imagen?: string;
  observacion?: string;
  color?: string;
  // Campos del establecimiento
  imagenEstablecimiento?: string;
  observacionEstablecimiento?: string;
  colorEstablecimiento?: string;
  direccion?: string;
  telefono?: string;
}) {
  try {
    const ubicacion = await prisma.ubicacion.create({
      data: {
        establecimiento: data.establecimiento,
        area: data.area,
        descripcion: data.descripcion,
        // Área
        imagen: data.imagen,
        observacion: data.observacion,
        color: data.color,
        // Establecimiento
        imagenEstablecimiento: data.imagenEstablecimiento,
        observacionEstablecimiento: data.observacionEstablecimiento,
        colorEstablecimiento: data.colorEstablecimiento,
        direccion: data.direccion,
        telefono: data.telefono,
      },
    });
    return ubicacion;
  } catch (error) {
    console.error("Error creating ubicacion:", error);
    throw new Error("Failed to create ubicacion");
  }
}

export async function updateUbicacion(
  id: string,
  data: {
    establecimiento?: string;
    area?: string;
    descripcion?: string;
    // Campos del área
    imagen?: string;
    observacion?: string;
    color?: string;
    // Campos del establecimiento
    imagenEstablecimiento?: string;
    observacionEstablecimiento?: string;
    colorEstablecimiento?: string;
    direccion?: string;
    telefono?: string;
  }
) {
  try {
    const ubicacion = await prisma.ubicacion.update({
      where: { id },
      data: {
        ...(data.establecimiento && { establecimiento: data.establecimiento }),
        ...(data.area && { area: data.area }),
        ...(data.descripcion !== undefined && {
          descripcion: data.descripcion,
        }),
        // Área
        ...(data.imagen !== undefined && { imagen: data.imagen }),
        ...(data.observacion !== undefined && {
          observacion: data.observacion,
        }),
        ...(data.color !== undefined && { color: data.color }),
        // Establecimiento
        ...(data.imagenEstablecimiento !== undefined && {
          imagenEstablecimiento: data.imagenEstablecimiento,
        }),
        ...(data.observacionEstablecimiento !== undefined && {
          observacionEstablecimiento: data.observacionEstablecimiento,
        }),
        ...(data.colorEstablecimiento !== undefined && {
          colorEstablecimiento: data.colorEstablecimiento,
        }),
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
      },
    });
    return ubicacion;
  } catch (error) {
    console.error("Error updating ubicacion:", error);
    throw new Error("Failed to update ubicacion");
  }
}

export async function deleteUbicacion(id: string) {
  try {
    // Primero verificar si tiene equipos asociados
    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id },
      include: { _count: { select: { equipos: true } } },
    });

    if (ubicacion && ubicacion._count.equipos > 0) {
      throw new Error(
        "No se puede eliminar una ubicación con equipos asociados"
      );
    }

    await prisma.ubicacion.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting ubicacion:", error);
    throw new Error(error.message || "Failed to delete ubicacion");
  }
}

export async function renameEstablecimiento(oldName: string, newName: string) {
  try {
    // Actualizar todas las ubicaciones con ese establecimiento
    const result = await prisma.ubicacion.updateMany({
      where: { establecimiento: oldName },
      data: { establecimiento: newName },
    });
    return { count: result.count };
  } catch (error) {
    console.error("Error renaming establecimiento:", error);
    throw new Error("Failed to rename establecimiento");
  }
}

export async function getEstablecimientos() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      select: {
        establecimiento: true,
      },
      distinct: ["establecimiento"],
      orderBy: { establecimiento: "asc" },
    });
    return ubicaciones.map((u) => u.establecimiento);
  } catch (error) {
    console.error("Error fetching establecimientos:", error);
    throw new Error("Failed to fetch establecimientos");
  }
}

export async function updateEstablecimientoInfo(
  establecimiento: string,
  data: {
    imagenEstablecimiento?: string;
    observacionEstablecimiento?: string;
    colorEstablecimiento?: string;
    direccion?: string;
    telefono?: string;
  }
) {
  try {
    // Actualizar la información del establecimiento en todas las ubicaciones
    const result = await prisma.ubicacion.updateMany({
      where: { establecimiento },
      data: {
        ...(data.imagenEstablecimiento !== undefined && {
          imagenEstablecimiento: data.imagenEstablecimiento,
        }),
        ...(data.observacionEstablecimiento !== undefined && {
          observacionEstablecimiento: data.observacionEstablecimiento,
        }),
        ...(data.colorEstablecimiento !== undefined && {
          colorEstablecimiento: data.colorEstablecimiento,
        }),
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
      },
    });
    return { count: result.count };
  } catch (error) {
    console.error("Error updating establecimiento info:", error);
    throw new Error("Failed to update establecimiento info");
  }
}

export async function deleteEstablecimiento(establecimiento: string) {
  try {
    // 1. Obtener todas las ubicaciones de este establecimiento
    const ubicaciones = await prisma.ubicacion.findMany({
      where: { establecimiento },
      include: { _count: { select: { equipos: true } } },
    });

    if (ubicaciones.length === 0) {
      return { success: true, count: 0 };
    }

    // 2. Verificar si alguna tiene equipos
    const conEquipos = ubicaciones.filter((u) => u._count.equipos > 0);
    if (conEquipos.length > 0) {
      throw new Error(
        `No se puede eliminar el establecimiento. Hay ${conEquipos.length} áreas con equipos asignados.`
      );
    }

    // 3. Eliminar todas las ubicaciones
    const result = await prisma.ubicacion.deleteMany({
      where: { establecimiento },
    });

    return { success: true, count: result.count };
  } catch (error: any) {
    console.error("Error deleting establecimiento:", error);
    throw new Error(error.message || "Failed to delete establecimiento");
  }
}
