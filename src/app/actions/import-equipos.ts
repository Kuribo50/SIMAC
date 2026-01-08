"use server";

import prisma from "../../lib/prisma";
import { revalidateGlobal } from "@/lib/revalidation";
import { EstadoEquipo } from "@prisma/client";
import * as XLSX from "xlsx";
import { logAudit } from "@/lib/audit";

// Defined locally to match the expected Excel structure
interface EquipoImportRow {
  Nombre: string;
  Marca?: string;
  Modelo?: string;
  Serie?: string;
  Inventario?: string;
  Estado?: string;
  Critico?: string; // SI/NO or YES/NO or true/false
  Establecimiento: string;
  Area: string;
  Tipo: string; // Creates ambiguity if not unique, but we'll try to match 'subcategoria' or 'codigo'
  Imagen?: string;
}

export async function processBulkImport(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No se ha subido ningún archivo" };
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<EquipoImportRow>(sheet);

    if (rows.length === 0) {
      return { success: false, error: "El archivo está vacío" };
    }

    const results = {
      total: rows.length,
      success: 0,
      errors: [] as string[],
    };

    // Pre-fetch catalogs to minimize DB queries inside loop (optimization)
    // However, for reliability with concurrent edits, fetching per row or small batches is safer.
    // Given the scale might be hundreds, fetching all might be okay.
    // Let's cache them in maps.
    const ubicaciones = await prisma.ubicacion.findMany();
    const tipos = await prisma.tipoEquipo.findMany();

    // Create lookup maps
    // Map key: "ESTABLECIMIENTO|AREA" (normalized)
    const ubicacionMap = new Map<string, string>();
    ubicaciones.forEach((u) => {
      const key = `${u.establecimiento.trim().toUpperCase()}|${u.area
        .trim()
        .toUpperCase()}`;
      ubicacionMap.set(key, u.id);
    });

    // Map key: CODE and SUBCATEGORIA (normalized)
    const tipoMap = new Map<string, string>();
    tipos.forEach((t) => {
      tipoMap.set(t.codigo.trim().toUpperCase(), t.id);
      tipoMap.set(t.subcategoria.trim().toUpperCase(), t.id);
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-based header is 1)

      try {
        // Validation of required fields
        if (!row.Nombre) throw new Error("Falta el Nombre");
        if (!row.Establecimiento) throw new Error("Falta el Establecimiento");
        if (!row.Area) throw new Error("Falta el Área");
        if (!row.Tipo) throw new Error("Falta el Tipo de Equipo");

        // Resolve Ubicacion
        const ubiKey = `${row.Establecimiento.trim().toUpperCase()}|${row.Area.trim().toUpperCase()}`;
        const ubicacionId = ubicacionMap.get(ubiKey);

        if (!ubicacionId) {
          throw new Error(
            `Ubicación no encontrada: ${row.Establecimiento} - ${row.Area}`
          );
        }

        // Resolve TipoEquipo
        const tipoKey = row.Tipo.trim().toUpperCase();
        let tipoEquipoId = tipoMap.get(tipoKey);

        // Fallback: Try fuzzy search or just fail? Fail is safer.
        if (!tipoEquipoId) {
          // Maybe they used the "Categoria" instead? Unexpected.
          throw new Error(`Tipo de equipo no encontrado: ${row.Tipo}`);
        }

        // Normalize Enum
        let estado = EstadoEquipo.OPERATIVO;
        if (row.Estado) {
          const normalizedState = row.Estado.trim().toUpperCase();
          if (
            Object.values(EstadoEquipo).includes(
              normalizedState as EstadoEquipo
            )
          ) {
            estado = normalizedState as EstadoEquipo;
          }
        }

        const isCritico =
          row.Critico?.toString().toUpperCase() === "SI" ||
          row.Critico?.toString().toUpperCase() === "YES" ||
          row.Critico === "true";

        const created = await prisma.equipo.create({
          data: {
            nombre: row.Nombre,
            marca: row.Marca,
            modelo: row.Modelo,
            serie: row.Serie ? String(row.Serie) : undefined,
            inventario: row.Inventario ? String(row.Inventario) : undefined,
            estado: estado,
            esCritico: isCritico,
            ubicacionId: ubicacionId,
            tipoEquipoId: tipoEquipoId,
            imageUrl: row.Imagen,
          },
        });

        // Audit log (optional but good practice, maybe batched?)
        // Logging every single insert might spam the log, but let's do it for consistency.
        /* await logAudit({
          action: "CREATE",
          entity: "Equipo",
          entityId: created.id,
          entityName: created.nombre,
          details: { source: "Bulk Import" },
        }); */

        results.success++;
      } catch (err: any) {
        results.errors.push(`Fila ${rowNum}: ${err.message}`);
      }
    }

    if (results.success > 0) {
      await revalidateGlobal();
    }

    return { success: true, results };
  } catch (error: any) {
    console.error("Error bulk importing:", error);
    return {
      success: false,
      error: "Error procesando el archivo: " + error.message,
    };
  }
}
