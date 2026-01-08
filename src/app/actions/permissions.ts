"use server";

import { revalidatePath } from "next/cache";
import { RolUsuario } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  getRolePermissions,
  saveRolePermissions,
  getAllPermissions,
  getPermissionsBySection,
  DEFAULT_PERMISSIONS,
} from "@/lib/permissions";

// Obtener todos los permisos disponibles
export async function getAvailablePermissions() {
  return {
    all: getAllPermissions(),
    bySection: getPermissionsBySection(),
  };
}

// Obtener permisos de un rol
export async function getPermissionsForRole(rol: RolUsuario) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para ver esta información");
  }

  const permissions = await getRolePermissions(rol);
  return permissions;
}

// Guardar permisos de un rol
export async function updateRolePermissions(
  rol: RolUsuario,
  permisos: string[]
) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  // No permitir modificar permisos de ADMINISTRADOR
  if (rol === "ADMINISTRADOR") {
    throw new Error(
      "No se pueden modificar los permisos del rol Administrador"
    );
  }

  await saveRolePermissions(rol, permisos);

  // Log de cambio de permisos
  await logAudit({
    action: "CHANGE_PERMISSIONS",
    entity: "Permisos",
    entityName: `Rol ${rol}`,
    details: { cantidadPermisos: permisos.length },
  });

  revalidatePath("/admin/roles");
  revalidatePath("/");

  return { success: true };
}

// Resetear permisos de un rol a los valores por defecto
export async function resetRolePermissions(rol: RolUsuario) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  if (rol === "ADMINISTRADOR") {
    throw new Error("No se pueden resetear los permisos del rol Administrador");
  }

  await saveRolePermissions(rol, DEFAULT_PERMISSIONS[rol]);
  revalidatePath("/admin/roles");

  return { success: true };
}

// Obtener resumen de permisos por rol
export async function getPermissionsSummary() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para ver esta información");
  }

  const roles: RolUsuario[] = ["VISUALIZADOR", "REGISTRADOR", "ADMINISTRADOR"];
  const summary: Record<
    RolUsuario,
    { total: number; pages: number; actions: number }
  > = {
    VISUALIZADOR: { total: 0, pages: 0, actions: 0 },
    REGISTRADOR: { total: 0, pages: 0, actions: 0 },
    ADMINISTRADOR: { total: 0, pages: 0, actions: 0 },
  };

  for (const rol of roles) {
    const permissions = await getRolePermissions(rol);
    summary[rol] = {
      total: permissions.length,
      pages: permissions.filter((p) => p.startsWith("page:")).length,
      actions: permissions.filter((p) => p.startsWith("action:")).length,
    };
  }

  return summary;
}
