import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mantencionId, observaciones } = body;

    if (!mantencionId) {
      return NextResponse.json(
        { error: "Falta el ID de la mantención" },
        { status: 400 }
      );
    }

    // Verificar que la mantención exista y no esté completada
    const mantencion = await prisma.mantencion.findUnique({
      where: { id: mantencionId },
    });

    if (!mantencion) {
      return NextResponse.json(
        { error: "Mantención no encontrada" },
        { status: 404 }
      );
    }

    if (mantencion.estadoMantencion === "COMPLETADA") {
      return NextResponse.json(
        { error: "No se puede modificar una mantención completada" },
        { status: 400 }
      );
    }

    // Actualizar observaciones
    const updatedMantencion = await prisma.mantencion.update({
      where: { id: mantencionId },
      data: { observaciones },
    });

    return NextResponse.json({ success: true, mantencion: updatedMantencion });
  } catch (error) {
    console.error("Error al guardar observaciones:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
