import { cookies } from "next/headers";
import prisma from "./prisma";
import { RolUsuario } from "@prisma/client";

// Tipo para la sesión del usuario
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  rol: RolUsuario;
  cargo: string | null;
};

// Nombre de la cookie de sesión
const SESSION_COOKIE = "session_token";

// Codificar datos de sesión en base64 (simple, en producción usar JWT)
function encodeSession(userId: string): string {
  const data = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

// Decodificar datos de sesión
function decodeSession(
  token: string
): { userId: string; timestamp: number } | null {
  try {
    const data = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return data;
  } catch {
    return null;
  }
}

// Verificar credenciales y crear sesión
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        rol: true,
        cargo: true,
        activo: true,
      },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (!user.activo) {
      return { success: false, error: "Usuario desactivado" };
    }

    // Verificar contraseña (en producción usar bcrypt)
    if (user.password !== password) {
      return { success: false, error: "Contraseña incorrecta" };
    }

    // Crear token con el ID del usuario
    const token = encodeSession(user.id);

    // Guardar token en cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      rol: user.rol,
      cargo: user.cargo,
    };

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Error al iniciar sesión" };
  }
}

// Cerrar sesión
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Obtener usuario actual de la sesión
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    // Decodificar el token para obtener el userId
    const sessionData = decodeSession(token);

    if (!sessionData) {
      // Token inválido - solo retornar null, no modificar cookies aquí
      // La cookie se limpiará en el siguiente login o logout
      return null;
    }

    // Verificar que el usuario existe y está activo en la BD
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        rol: true,
        cargo: true,
        activo: true,
      },
    });

    if (!user || !user.activo) {
      // Usuario no existe o está desactivado - solo retornar null
      // No podemos eliminar cookies aquí (solo en Server Actions/Route Handlers)
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      rol: user.rol,
      cargo: user.cargo,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Verificar si el usuario tiene un rol específico
export function hasRole(
  user: SessionUser | null,
  roles: RolUsuario[]
): boolean {
  if (!user) return false;
  return roles.includes(user.rol);
}

// Verificar si es administrador
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, [RolUsuario.ADMINISTRADOR]);
}

// Verificar si puede registrar (registrador o admin)
export function canRegister(user: SessionUser | null): boolean {
  return hasRole(user, [RolUsuario.REGISTRADOR, RolUsuario.ADMINISTRADOR]);
}

// Permisos por rol
export const permissions = {
  // Ver información
  canView: (user: SessionUser | null) => user !== null,

  // Crear/editar mantenciones
  canCreate: (user: SessionUser | null) =>
    hasRole(user, [RolUsuario.REGISTRADOR, RolUsuario.ADMINISTRADOR]),

  // Administrar usuarios
  canManageUsers: (user: SessionUser | null) =>
    hasRole(user, [RolUsuario.ADMINISTRADOR]),

  // Acceso a configuración
  canAccessConfig: (user: SessionUser | null) =>
    hasRole(user, [RolUsuario.ADMINISTRADOR]),
};
