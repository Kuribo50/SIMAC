import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ equipos: [], pautas: [], mantenciones: [] });
  }

  try {
    const isNumeric = !isNaN(Number(query));

    // 1. Equipos (Existing logic)
    const equiposPromise = prisma.equipo.findMany({
      where: {
        OR: [
          { nombre: { contains: query } },
          { modelo: { contains: query } },
          { marca: { contains: query } },
          { serie: { contains: query } },
          { inventario: { contains: query } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        modelo: true,
        imageUrl: true,
        ubicacion: {
          select: {
            establecimiento: true,
            area: true,
          },
        },
        tipoEquipo: {
          select: {
            subcategoria: true,
          },
        },
      },
      take: 5,
    });

    // 2. Pautas
    const pautasPromise = prisma.pautaMantenimiento.findMany({
      where: {
        OR: [{ nombre: { contains: query } }, { codigo: { contains: query } }],
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        version: true,
      },
      take: 5,
    });

    // 3. Mantenciones (Folios)
    // Only search if query looks like a number, OR search by other fields if needed? User specifically said "folios".
    // Folio is Int.
    let mantencionesPromise = Promise.resolve([]);
    if (isNumeric) {
      const folioNumber = parseInt(query);
      mantencionesPromise = prisma.mantencion.findMany({
        where: {
          folio: { equals: folioNumber },
        },
        select: {
          id: true,
          folio: true,
          fecha: true,
          equipo: {
            select: {
              nombre: true,
            },
          },
          estadoMantencion: true,
        },
        take: 5,
      }) as any;
    }

    // Execute in parallel
    const [equipos, pautas, mantenciones] = await Promise.all([
      equiposPromise,
      pautasPromise,
      mantencionesPromise,
    ]);

    return NextResponse.json({
      equipos,
      pautas,
      mantenciones,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
