import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ equipos: [] });
    }

    // SQLite no soporta mode: "insensitive", usamos contains directamente
    const equipos = await prisma.equipo.findMany({
      where: {
        OR: [
          { nombre: { contains: query } },
          { modelo: { contains: query } },
          { marca: { contains: query } },
          { serie: { contains: query } },
          { inventario: { contains: query } },
          { ubicacion: { establecimiento: { contains: query } } },
          { ubicacion: { area: { contains: query } } },
          { tipoEquipo: { subcategoria: { contains: query } } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        modelo: true,
        marca: true,
        estado: true,
        ubicacion: {
          select: {
            establecimiento: true,
            area: true,
          },
        },
        imageUrl: true,
        tipoEquipo: {
          select: {
            categoria: true,
            subcategoria: true,
          },
        },
      },
      take: 10,
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ equipos });
  } catch (error) {
    console.error("Error buscando equipos:", error);
    return NextResponse.json(
      { equipos: [], error: "Error en la búsqueda" },
      { status: 500 }
    );
  }
}
