import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folioParam = searchParams.get("folio");

    if (!folioParam) {
      return NextResponse.json(
        { error: "Folio es requerido" },
        { status: 400 }
      );
    }

    const folio = parseInt(folioParam, 10);

    if (isNaN(folio) || folio <= 0) {
      return NextResponse.json(
        { error: "Folio debe ser un número válido" },
        { status: 400 }
      );
    }

    const mantencion = await prisma.mantencion.findFirst({
      where: { folio },
      select: {
        id: true,
        folio: true,
        fecha: true,
        tipoMantencion: true,
        estadoMantencion: true,
        equipo: {
          select: {
            nombre: true,
            marca: true,
            modelo: true,
            ubicacion: {
              select: {
                area: true,
                establecimiento: true,
              },
            },
          },
        },
        firmas: {
          select: {
            role: true,
            nombreFirmante: true,
          },
        },
      },
    });

    if (!mantencion) {
      return NextResponse.json(
        { error: `No se encontró mantención con folio #${folio}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ mantencion });
  } catch (error) {
    console.error("Error al buscar por folio:", error);
    return NextResponse.json(
      { error: "Error al buscar la mantención" },
      { status: 500 }
    );
  }
}
