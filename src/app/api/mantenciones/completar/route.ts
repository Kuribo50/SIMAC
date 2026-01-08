import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notificarMantencionCompletada } from "@/app/actions/notificaciones";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mantencionId, observaciones, checklistResponses } = body;

    if (!mantencionId) {
      return NextResponse.json(
        { error: "Falta el ID de la mantención" },
        { status: 400 }
      );
    }

    // Verificar que la mantención exista y tenga ambas firmas
    const mantencion = await prisma.mantencion.findUnique({
      where: { id: mantencionId },
      include: {
        firmas: true,
      },
    });

    if (!mantencion) {
      return NextResponse.json(
        { error: "Mantención no encontrada" },
        { status: 404 }
      );
    }

    const firmaTecnico = mantencion.firmas.find((f) => f.role === "TECNICO");
    const firmaResponsable = mantencion.firmas.find(
      (f) => f.role === "RESPONSABLE"
    );

    if (!firmaTecnico || !firmaResponsable) {
      return NextResponse.json(
        {
          error:
            "Se requieren ambas firmas (Técnico y Responsable) para completar la mantención",
        },
        { status: 400 }
      );
    }

    // Transaction: Save responses -> Verify Count -> Complete
    const updatedMantencion = await prisma.$transaction(async (tx) => {
      // 1. Save Checklist Responses (parallel upserts)
      if (checklistResponses && Object.keys(checklistResponses).length > 0) {
        const ops = Object.entries(checklistResponses).map(
          ([pautaItemId, isCompleted]) => {
            return tx.mantencionChecklistResponse.upsert({
              where: {
                mantencionId_pautaItemId: {
                  mantencionId,
                  pautaItemId,
                },
              },
              update: {
                isCompleted: Boolean(isCompleted),
              },
              create: {
                mantencionId,
                pautaItemId,
                isCompleted: Boolean(isCompleted),
              },
            });
          }
        );
        await Promise.all(ops);
      }

      // 2. Refresh Responses to count completed (using correct model name)
      const savedResponses = await tx.mantencionChecklistResponse.findMany({
        where: { mantencionId, isCompleted: true },
      });

      if (savedResponses.length < 1) {
        throw new Error("Debe completar al menos 1 item del checklist.");
      }

      // 3. Mark as Completed
      return await tx.mantencion.update({
        where: { id: mantencionId },
        data: {
          estadoMantencion: "COMPLETADA",
          completadaEn: new Date(),
          observaciones: observaciones,
        },
      });
    });

    // Notificar que se completó la mantención
    await notificarMantencionCompletada(mantencionId);

    return NextResponse.json({ success: true, mantencion: updatedMantencion });
  } catch (error) {
    console.error("Error al completar mantención:", error);
    return NextResponse.json(
      { error: "Error al completar la mantención" },
      { status: 500 }
    );
  }
}
