import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Función para generar el siguiente folio
async function getNextFolio(): Promise<number> {
  const lastMantencion = await prisma.mantencion.findFirst({
    where: {
      folio: { not: null },
    },
    orderBy: { folio: "desc" },
    select: { folio: true },
  });

  return (lastMantencion?.folio || 0) + 1;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mantencionId,
      fecha,
      equiposDePrueba,
      periodicidad,
      equipoNombre,
      ubicacionId,
      generateFolio,
    } = body;

    if (!mantencionId) {
      return NextResponse.json(
        { error: "ID de mantención requerido" },
        { status: 400 }
      );
    }

    // Verificar que la mantención existe y no está completada
    const mantencion = await prisma.mantencion.findUnique({
      where: { id: mantencionId },
      include: { equipo: true },
    });

    if (!mantencion) {
      return NextResponse.json(
        { error: "Mantención no encontrada" },
        { status: 404 }
      );
    }

    if (mantencion.estadoMantencion === "COMPLETADA") {
      return NextResponse.json(
        { error: "No se puede editar una mantención completada" },
        { status: 400 }
      );
    }

    // Construir objeto de actualización para mantención
    const updateData: any = {};

    if (fecha) {
      updateData.fecha = new Date(fecha);
    }

    if (equiposDePrueba !== undefined) {
      updateData.equiposDePrueba = equiposDePrueba;
    }

    if (periodicidad !== undefined) {
      updateData.periodicidad = periodicidad;
    }

    // Generar folio si se solicita y no tiene uno
    if (generateFolio && !mantencion.folio) {
      updateData.folio = await getNextFolio();
    }

    // Actualizar la mantención
    const updated = await prisma.mantencion.update({
      where: { id: mantencionId },
      data: updateData,
    });

    // Si se necesita actualizar datos del equipo
    if (equipoNombre || ubicacionId) {
      const equipoUpdateData: any = {};
      if (equipoNombre) {
        equipoUpdateData.nombre = equipoNombre;
      }
      if (ubicacionId) {
        equipoUpdateData.ubicacionId = ubicacionId;
      }

      await prisma.equipo.update({
        where: { id: mantencion.equipoId },
        data: equipoUpdateData,
      });
    }

    return NextResponse.json({ success: true, mantencion: updated });
  } catch (error) {
    console.error("Error al actualizar mantención:", error);
    return NextResponse.json(
      { error: "Error al actualizar la mantención" },
      { status: 500 }
    );
  }
}
