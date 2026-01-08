"use server";

import { login, logout, getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RolUsuario } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

// Action para iniciar sesión
export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const result = await login(email, password);

  if (result.success) {
    // Log de inicio de sesión
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (user) {
      await logAudit({
        action: "LOGIN",
        entity: "Session",
        entityName: user.email,
        userId: user.id,
        userName: user.name || undefined,
        userEmail: user.email,
      });
    }
    revalidatePath("/");
  }

  return { success: result.success, error: result.error };
}

// Action para cerrar sesión
export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await logAudit({
      action: "LOGOUT",
      entity: "Session",
      entityName: user.email,
      userId: user.id,
      userName: user.name || undefined,
      userEmail: user.email,
    });
  }
  await logout();
  revalidatePath("/");
}

// Action para obtener usuario actual
export async function getSessionUser() {
  return getCurrentUser();
}

// ==================== GESTIÓN DE USUARIOS ====================

// Obtener todos los usuarios
export async function getUsers() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      rut: true,
      cargo: true,
      rol: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });
}

// Crear usuario
export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  rut?: string;
  cargo?: string;
  rol: RolUsuario;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  // Verificar si el email ya existe
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existing) {
    throw new Error("El email ya está registrado");
  }

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      password: data.password, // En producción, hashear
      rut: data.rut || null,
      cargo: data.cargo || null,
      rol: data.rol,
      activo: true,
    },
  });

  // Log de creación de usuario
  await logAudit({
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    entityName: `${user.name} (${user.email})`,
    details: { rol: data.rol },
  });

  revalidatePath("/admin/usuarios");
  return user;
}

// Actualizar usuario
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    rut?: string;
    cargo?: string;
    rol?: RolUsuario;
    activo?: boolean;
  }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/admin/usuarios");
  return user;
}

// Reiniciar contraseña
export async function resetPassword(userId: string, newPassword: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword }, // En producción, hashear
  });

  // Log de reinicio de contraseña
  await logAudit({
    action: "RESET_PASSWORD",
    entity: "User",
    entityId: userId,
    entityName: user?.name || user?.email || userId,
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

// Cambiar estado activo/inactivo
export async function toggleUserStatus(userId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  // No permitir desactivarse a sí mismo
  if (currentUser.id === userId) {
    throw new Error("No puedes desactivarte a ti mismo");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { activo: !user.activo },
  });

  // Log de cambio de estado
  await logAudit({
    action: "CHANGE_STATUS",
    entity: "User",
    entityId: userId,
    entityName: `${user.name} (${user.email})`,
    details: { nuevoEstado: !user.activo ? "Activo" : "Inactivo" },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

// Cambiar rol de usuario
export async function changeUserRole(userId: string, newRole: RolUsuario) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  // No permitir cambiarse el rol a sí mismo
  if (currentUser.id === userId) {
    throw new Error("No puedes cambiar tu propio rol");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { rol: newRole },
  });

  // Log de cambio de rol
  await logAudit({
    action: "CHANGE_ROLE",
    entity: "User",
    entityId: userId,
    entityName: `${user.name} (${user.email})`,
    details: { rolAnterior: user.rol, nuevoRol: newRole },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

// Eliminar usuario
export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  // No permitir eliminarse a sí mismo
  if (currentUser.id === userId) {
    throw new Error("No puedes eliminarte a ti mismo");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  await prisma.user.delete({
    where: { id: userId },
  });

  // Log de eliminación de usuario
  await logAudit({
    action: "DELETE",
    entity: "User",
    entityId: userId,
    entityName: user ? `${user.name} (${user.email})` : userId,
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

// Cambiar contraseña propia
export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("No autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });

  if (!user || user.password !== currentPassword) {
    throw new Error("Contraseña actual incorrecta");
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { password: newPassword },
  });

  return { success: true };
}
