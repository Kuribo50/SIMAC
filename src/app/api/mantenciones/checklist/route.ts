import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mantencionId,
      pautaItemId,
      isCompleted,
      comment,
      isAdminEdit,
      adminName,
    } = body;

    if (!mantencionId || !pautaItemId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la mantención exista y obtener items de pauta
    const mantencion = await prisma.mantencion.findUnique({
      where: { id: mantencionId },
      include: {
        pauta: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!mantencion) {
      return NextResponse.json(
        { error: "Mantención no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos para mantenciones completadas
    if (mantencion.estadoMantencion === "COMPLETADA") {
      const currentUser = await getCurrentUser();
      const userIsAdmin = isAdmin(currentUser);

      if (!userIsAdmin) {
        return NextResponse.json(
          { error: "No se puede modificar una mantención completada" },
          { status: 400 }
        );
      }

      // Si es admin editando mantención completada, registrar la edición
      if (isAdminEdit && adminName) {
        await prisma.mantencion.update({
          where: { id: mantencionId },
          data: {
            editedAfterCompletionAt: new Date(),
            editedAfterCompletionBy: adminName,
          },
        });
      }
    }

    // Buscar respuesta existente o crear una nueva
    const existingResponse = await prisma.mantencionChecklistResponse.findFirst(
      {
        where: {
          mantencionId,
          pautaItemId,
        },
      }
    );

    let respuesta;

    if (existingResponse) {
      // Actualizar respuesta existente
      respuesta = await prisma.mantencionChecklistResponse.update({
        where: { id: existingResponse.id },
        data: {
          isCompleted,
          comment: comment || null,
        },
      });
    } else {
      // Crear nueva respuesta
      respuesta = await prisma.mantencionChecklistResponse.create({
        data: {
          mantencionId,
          pautaItemId,
          isCompleted,
          comment: comment || null,
        },
      });
    }

    // Si es la primera interacción, cambiar estado a EN_PROCESO
    if (mantencion.estadoMantencion === "PENDIENTE") {
      await prisma.mantencion.update({
        where: { id: mantencionId },
        data: { estadoMantencion: "EN_PROCESO" },
      });
    }

    // Verificar si todos los items están completados para auto-completar
    if (
      mantencion.estadoMantencion !== "COMPLETADA" &&
      mantencion.pauta?.items
    ) {
      const totalItems = mantencion.pauta.items.length;

      if (totalItems > 0) {
        // Obtener todas las respuestas actuales
        const allResponses = await prisma.mantencionChecklistResponse.findMany({
          where: { mantencionId },
        });

        // Contar cuántos están completados
        const completedCount = allResponses.filter((r) => r.isCompleted).length;

        // Si todos los items están completados, cambiar estado a COMPLETADA
        if (completedCount === totalItems) {
          await prisma.mantencion.update({
            where: { id: mantencionId },
            data: { estadoMantencion: "COMPLETADA" },
          });
        }
      }
    }

    // Revalidar la ruta para forzar actualización del cache de Next.js
    revalidatePath(`/mantenciones/${mantencionId}/visualizar`);
    revalidatePath("/mantenciones");
    revalidatePath("/planificacion");

    return NextResponse.json({ success: true, respuesta });
  } catch (error) {
    console.error("Error al actualizar checklist:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
