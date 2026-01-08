import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mantencionId,
      role,
      nombreFirmante,
      rutFirmante,
      cargoFirmante,
      firmaImagen,
    } = body;

    if (!mantencionId || !role || !nombreFirmante) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (
      !firmaImagen ||
      typeof firmaImagen !== "string" ||
      !firmaImagen.trim()
    ) {
      return NextResponse.json(
        { error: "La firma digital es obligatoria" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una firma con ese rol para esta mantención
    const existingSignature = await prisma.maintenanceSignature.findFirst({
      where: {
        mantencionId,
        role,
      },
    });

    if (existingSignature) {
      return NextResponse.json(
        { error: "Ya existe una firma de este tipo para esta mantención" },
        { status: 400 }
      );
    }

    // Crear la firma
    const firma = await prisma.maintenanceSignature.create({
      data: {
        mantencion: {
          connect: { id: mantencionId },
        },
        role,
        nombreFirmante,
        rutFirmante: rutFirmante || null,
        cargoFirmante: cargoFirmante || null,
        firmaImagen,
      },
    });

    // Si la mantención está pendiente, cambiarla a EN_PROCESO
    await prisma.mantencion.update({
      where: { id: mantencionId },
      data: {
        estadoMantencion: "EN_PROCESO",
      },
    });

    return NextResponse.json({ success: true, firma });
  } catch (error) {
    console.error("Error al firmar mantención:", error);
    return NextResponse.json(
      { error: "Error al procesar la firma" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una firma existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { firmaId, nombreFirmante, rutFirmante, cargoFirmante, firmaImagen } =
      body;

    if (!firmaId || !nombreFirmante) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (
      !firmaImagen ||
      typeof firmaImagen !== "string" ||
      !firmaImagen.trim()
    ) {
      return NextResponse.json(
        { error: "La firma digital es obligatoria" },
        { status: 400 }
      );
    }

    // Verificar que la firma existe y que la mantención no está completada
    const existingFirma = await prisma.maintenanceSignature.findUnique({
      where: { id: firmaId },
      include: { mantencion: true },
    });

    if (!existingFirma) {
      return NextResponse.json(
        { error: "Firma no encontrada" },
        { status: 404 }
      );
    }

    if (existingFirma.mantencion.estadoMantencion === "COMPLETADA") {
      return NextResponse.json(
        { error: "No se puede editar una firma de una mantención completada" },
        { status: 400 }
      );
    }

    // Actualizar la firma
    const firma = await prisma.maintenanceSignature.update({
      where: { id: firmaId },
      data: {
        nombreFirmante,
        rutFirmante: rutFirmante || null,
        cargoFirmante: cargoFirmante || null,
        firmaImagen,
      },
    });

    return NextResponse.json({ success: true, firma });
  } catch (error) {
    console.error("Error al actualizar firma:", error);
    return NextResponse.json(
      { error: "Error al actualizar la firma" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una firma
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmaId = searchParams.get("firmaId");

    if (!firmaId) {
      return NextResponse.json(
        { error: "ID de firma requerido" },
        { status: 400 }
      );
    }

    // Verificar que la firma existe y que la mantención no está completada
    const existingFirma = await prisma.maintenanceSignature.findUnique({
      where: { id: firmaId },
      include: { mantencion: true },
    });

    if (!existingFirma) {
      return NextResponse.json(
        { error: "Firma no encontrada" },
        { status: 404 }
      );
    }

    if (existingFirma.mantencion.estadoMantencion === "COMPLETADA") {
      return NextResponse.json(
        {
          error: "No se puede eliminar una firma de una mantención completada",
        },
        { status: 400 }
      );
    }

    // Eliminar la firma
    await prisma.maintenanceSignature.delete({
      where: { id: firmaId },
    });

    // Verificar si quedan firmas, si no, volver a PENDIENTE
    const remainingFirmas = await prisma.maintenanceSignature.count({
      where: { mantencionId: existingFirma.mantencionId },
    });

    if (remainingFirmas === 0) {
      await prisma.mantencion.update({
        where: { id: existingFirma.mantencionId },
        data: { estadoMantencion: "PENDIENTE" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar firma:", error);
    return NextResponse.json(
      { error: "Error al eliminar la firma" },
      { status: 500 }
    );
  }
}
