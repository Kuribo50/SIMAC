"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCatalogos(tipo: string) {
  try {
    const catalogos = await prisma.catalogo.findMany({
      where: {
        tipo,
        activo: true,
      },
      orderBy: {
        valor: "asc",
      },
    });
    return catalogos;
  } catch (error) {
    console.error(`Error al obtener catálogos tipo ${tipo}:`, error);
    return [];
  }
}

export async function createCatalogo(data: {
  tipo: string;
  valor: string;
  descripcion?: string;
}) {
  try {
    const catalogo = await prisma.catalogo.create({
      data: {
        tipo: data.tipo,
        valor: data.valor,
        descripcion: data.descripcion,
      },
    });
    revalidatePath("/admin/parametros");
    return { success: true, data: catalogo };
  } catch (error) {
    console.error("Error al crear catálogo:", error);
    throw new Error("Error al crear el registro");
  }
}

export async function updateCatalogo(
  id: string,
  data: { valor?: string; descripcion?: string; activo?: boolean }
) {
  try {
    const catalogo = await prisma.catalogo.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/parametros");
    return { success: true, data: catalogo };
  } catch (error) {
    console.error("Error al actualizar catálogo:", error);
    throw new Error("Error al actualizar el registro");
  }
}

export async function deleteCatalogo(id: string) {
  try {
    // Soft delete
    await prisma.catalogo.update({
      where: { id },
      data: { activo: false },
    });
    revalidatePath("/admin/parametros");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar catálogo:", error);
    throw new Error("Error al eliminar el registro");
  }
}

export async function seedCatalogos(tipo: string) {
  try {
    const defaultData: Record<
      string,
      { valor: string; descripcion: string }[]
    > = {
      CARGO: [
        { valor: "Kinesiólogo", descripcion: "Profesional de Kinesiología" },
        { valor: "Enfermero/a", descripcion: "Profesional de Enfermería" },
        { valor: "TENS", descripcion: "Técnico en Enfermería Nivel Superior" },
        { valor: "Médico", descripcion: "Médico General o Especialista" },
        { valor: "Administrativo", descripcion: "Personal Administrativo" },
        {
          valor: "Técnico Informático",
          descripcion: "Soporte y Mantención TI",
        },
        {
          valor: "Jefe de Mantención",
          descripcion: "Encargado de Área de Mantención",
        },
        { valor: "Directivo", descripcion: "Cargo Directivo" },
        { valor: "Nutricionista", descripcion: "Profesional de Nutrición" },
        { valor: "Psicólogo/a", descripcion: "Profesional de Salud Mental" },
        {
          valor: "Trabajador/a Social",
          descripcion: "Profesional de Asistencia Social",
        },
        { valor: "Odontólogo/a", descripcion: "Profesional de Salud Dental" },
        {
          valor: "Matrón/a",
          descripcion: "Profesional de Obstetricia y Puericultura",
        },
        {
          valor: "Tecnólogo Médico",
          descripcion: "Profesional de Tecnología Médica",
        },
        {
          valor: "Químico Farmacéutico",
          descripcion: "Profesional de Farmacia",
        },
      ],
      SECTOR: [
        { valor: "Sector Rojo", descripcion: "Sector Rojo (Norte)" },
        { valor: "Sector Azul", descripcion: "Sector Azul (Sur)" },
        { valor: "Sector Verde", descripcion: "Sector Verde (Centro)" },
        {
          valor: "Sector Amarillo",
          descripcion: "Sector Amarillo (Transversal)",
        },
        { valor: "Transversal", descripcion: "Servicios Transversales" },
        { valor: "Administración", descripcion: "Área Administrativa" },
        { valor: "Urgencia", descripcion: "Servicio de Urgencia (SAPU/SAR)" },
        { valor: "Farmacia", descripcion: "Unidad de Farmacia" },
        { valor: "Esterilización", descripcion: "Unidad de Esterilización" },
      ],
    };

    const items = defaultData[tipo] || [];

    // Create items sequentially to avoid race conditions with unique constraints if running purely parallel
    let createdCount = 0;
    for (const item of items) {
      // Check if exists
      const exists = await prisma.catalogo.findFirst({
        where: { tipo, valor: item.valor },
      });

      if (!exists) {
        await prisma.catalogo.create({
          data: {
            tipo,
            valor: item.valor,
            descripcion: item.descripcion,
          },
        });
        createdCount++;
      }
    }

    revalidatePath("/admin/parametros");
    return { success: true, count: createdCount };
  } catch (error) {
    console.error(`Error al sembrar catálogos tipo ${tipo}:`, error);
    throw new Error("Error al inicializar datos por defecto");
  }
}
