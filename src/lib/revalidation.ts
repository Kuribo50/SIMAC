"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalida toda la aplicación para asegurar que los datos estén frescos.
 * Debe llamarse después de cualquier mutación (crear, actualizar, eliminar).
 * Esto fuerza a Next.js a limpiar la caché de todas las rutas.
 */
export async function revalidateGlobal() {
  try {
    revalidatePath("/", "layout");
    console.log("[Revalidate] Full app revalidation triggered.");
  } catch (error) {
    console.error("[Revalidate] Error revalidating app:", error);
  }
}
