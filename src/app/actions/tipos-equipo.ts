"use server";

import prisma from "../../lib/prisma";
import { CategoriaEquipo } from "@prisma/client";

export async function getTiposEquipo() {
  try {
    const tipos = await prisma.tipoEquipo.findMany({
      include: {
        _count: {
          select: { equipos: true },
        },
      },
      orderBy: [{ categoria: "asc" }, { subcategoria: "asc" }],
    });
    return tipos;
  } catch (error) {
    console.error("Error fetching tipos de equipo:", error);
    throw new Error("Failed to fetch tipos de equipo");
  }
}

export async function getTipoEquipo(id: string) {
  try {
    const tipo = await prisma.tipoEquipo.findUnique({
      where: { id },
      include: {
        equipos: {
          include: {
            ubicacion: true,
          },
        },
      },
    });
    return tipo;
  } catch (error) {
    console.error("Error fetching tipo de equipo:", error);
    throw new Error("Failed to fetch tipo de equipo");
  }
}

export async function createTipoEquipo(data: {
  codigo: string;
  categoria: CategoriaEquipo;
  subcategoria: string;
}) {
  try {
    const tipo = await prisma.tipoEquipo.create({
      data: {
        codigo: data.codigo,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
      },
    });
    return tipo;
  } catch (error) {
    console.error("Error creating tipo de equipo:", error);
    throw new Error("Failed to create tipo de equipo");
  }
}
