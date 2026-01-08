import { RolUsuario } from "@prisma/client";
import { prisma } from "./prisma";

// Definición de todos los permisos del sistema
export const PERMISSIONS = {
  // Páginas - Visualización
  pages: {
    dashboard: {
      code: "page:dashboard",
      label: "Panel General",
      section: "Control Operacional",
    },
    planificacion: {
      code: "page:planificacion",
      label: "Planificación",
      section: "Control Operacional",
    },
    pendientes: {
      code: "page:pendientes",
      label: "Tareas Pendientes",
      section: "Control Operacional",
    },
    equipos: {
      code: "page:equipos",
      label: "Inventario Equipos",
      section: "Gestión de Activos",
    },
    ubicaciones: {
      code: "page:ubicaciones",
      label: "Ubicaciones",
      section: "Gestión de Activos",
    },
    pautas: {
      code: "page:pautas",
      label: "Pautas de Mantención",
      section: "Gestión de Activos",
    },
    buscarFolio: {
      code: "page:buscar_folio",
      label: "Buscar por Folio",
      section: "Reportes",
    },
    analitica: {
      code: "page:analitica",
      label: "Analítica",
      section: "Reportes",
    },
    historial: {
      code: "page:historial",
      label: "Historial Técnico",
      section: "Reportes",
    },
    establecimientos: {
      code: "page:establecimientos",
      label: "Establecimientos",
      section: "Reportes",
    },
    admin: { code: "page:admin", label: "Panel Admin", section: "Sistema" },
  },
  // Acciones - Interacción
  actions: {
    crearMantencion: {
      code: "action:crear_mantencion",
      label: "Crear Orden de Mantención",
      section: "Mantenciones",
    },
    editarMantencion: {
      code: "action:editar_mantencion",
      label: "Editar Mantención",
      section: "Mantenciones",
    },
    ejecutarMantencion: {
      code: "action:ejecutar_mantencion",
      label: "Ejecutar Mantención",
      section: "Mantenciones",
    },
    firmarMantencion: {
      code: "action:firmar_mantencion",
      label: "Firmar Mantención",
      section: "Mantenciones",
    },
    cancelarMantencion: {
      code: "action:cancelar_mantencion",
      label: "Cancelar Mantención",
      section: "Mantenciones",
    },
    exportarMantencion: {
      code: "action:exportar_mantencion",
      label: "Exportar/Imprimir Mantención",
      section: "Mantenciones",
    },
    crearEquipo: {
      code: "action:crear_equipo",
      label: "Crear Equipo",
      section: "Equipos",
    },
    editarEquipo: {
      code: "action:editar_equipo",
      label: "Editar Equipo",
      section: "Equipos",
    },
    eliminarEquipo: {
      code: "action:eliminar_equipo",
      label: "Eliminar Equipo",
      section: "Equipos",
    },
    crearPauta: {
      code: "action:crear_pauta",
      label: "Crear Pauta",
      section: "Pautas",
    },
    editarPauta: {
      code: "action:editar_pauta",
      label: "Editar Pauta",
      section: "Pautas",
    },
    eliminarPauta: {
      code: "action:eliminar_pauta",
      label: "Eliminar Pauta",
      section: "Pautas",
    },
    crearUbicacion: {
      code: "action:crear_ubicacion",
      label: "Crear Ubicación",
      section: "Ubicaciones",
    },
    editarUbicacion: {
      code: "action:editar_ubicacion",
      label: "Editar Ubicación",
      section: "Ubicaciones",
    },
    gestionarUsuarios: {
      code: "action:gestionar_usuarios",
      label: "Gestionar Usuarios",
      section: "Sistema",
    },
    gestionarPermisos: {
      code: "action:gestionar_permisos",
      label: "Gestionar Permisos",
      section: "Sistema",
    },
  },
} as const;

// Permisos por defecto para cada rol
export const DEFAULT_PERMISSIONS: Record<RolUsuario, string[]> = {
  VISUALIZADOR: [
    // Solo páginas de visualización
    PERMISSIONS.pages.dashboard.code,
    PERMISSIONS.pages.planificacion.code,
    PERMISSIONS.pages.pendientes.code,
    PERMISSIONS.pages.equipos.code,
    PERMISSIONS.pages.ubicaciones.code,
    PERMISSIONS.pages.pautas.code,
    PERMISSIONS.pages.buscarFolio.code,
    PERMISSIONS.pages.historial.code,
    PERMISSIONS.pages.establecimientos.code,
    // Solo exportar
    PERMISSIONS.actions.exportarMantencion.code,
  ],
  REGISTRADOR: [
    // Todas las páginas excepto admin
    PERMISSIONS.pages.dashboard.code,
    PERMISSIONS.pages.planificacion.code,
    PERMISSIONS.pages.pendientes.code,
    PERMISSIONS.pages.equipos.code,
    PERMISSIONS.pages.ubicaciones.code,
    PERMISSIONS.pages.pautas.code,
    PERMISSIONS.pages.buscarFolio.code,
    PERMISSIONS.pages.analitica.code,
    PERMISSIONS.pages.historial.code,
    PERMISSIONS.pages.establecimientos.code,
    // Acciones de mantención
    PERMISSIONS.actions.crearMantencion.code,
    PERMISSIONS.actions.editarMantencion.code,
    PERMISSIONS.actions.ejecutarMantencion.code,
    PERMISSIONS.actions.firmarMantencion.code,
    PERMISSIONS.actions.exportarMantencion.code,
    // Acciones de equipos (crear/editar)
    PERMISSIONS.actions.crearEquipo.code,
    PERMISSIONS.actions.editarEquipo.code,
    // Acciones de pautas (crear/editar)
    PERMISSIONS.actions.crearPauta.code,
    PERMISSIONS.actions.editarPauta.code,
    // Ubicaciones
    PERMISSIONS.actions.crearUbicacion.code,
    PERMISSIONS.actions.editarUbicacion.code,
  ],
  ADMINISTRADOR: [
    // Todas las páginas
    ...Object.values(PERMISSIONS.pages).map((p) => p.code),
    // Todas las acciones
    ...Object.values(PERMISSIONS.actions).map((p) => p.code),
  ],
};

// Obtener todos los permisos como lista plana
export function getAllPermissions() {
  const pages = Object.values(PERMISSIONS.pages).map((p) => ({
    ...p,
    type: "page" as const,
  }));
  const actions = Object.values(PERMISSIONS.actions).map((p) => ({
    ...p,
    type: "action" as const,
  }));
  return [...pages, ...actions];
}

// Agrupar permisos por sección
export function getPermissionsBySection() {
  const all = getAllPermissions();
  const sections: Record<string, typeof all> = {};

  for (const perm of all) {
    if (!sections[perm.section]) {
      sections[perm.section] = [];
    }
    sections[perm.section].push(perm);
  }

  return sections;
}

// Obtener permisos de un rol desde la base de datos
export async function getRolePermissions(rol: RolUsuario): Promise<string[]> {
  const permissions = await prisma.rolePermission.findMany({
    where: { rol, activo: true },
  });

  // Si no hay permisos configurados, usar los por defecto
  if (permissions.length === 0) {
    return DEFAULT_PERMISSIONS[rol];
  }

  return permissions.map((p) => p.permiso);
}

// Verificar si un rol tiene un permiso
export async function hasPermission(
  rol: RolUsuario,
  permiso: string
): Promise<boolean> {
  // Admin siempre tiene todos los permisos
  if (rol === "ADMINISTRADOR") {
    return true;
  }

  const permissions = await getRolePermissions(rol);
  return permissions.includes(permiso);
}

// Guardar permisos de un rol
export async function saveRolePermissions(
  rol: RolUsuario,
  permisos: string[]
): Promise<void> {
  // Eliminar permisos actuales
  await prisma.rolePermission.deleteMany({
    where: { rol },
  });

  // Crear nuevos permisos
  await prisma.rolePermission.createMany({
    data: permisos.map((permiso) => ({
      rol,
      permiso,
      activo: true,
    })),
  });
}

// Inicializar permisos por defecto si no existen
export async function initializeDefaultPermissions(): Promise<void> {
  for (const rol of Object.keys(DEFAULT_PERMISSIONS) as RolUsuario[]) {
    const existing = await prisma.rolePermission.count({
      where: { rol },
    });

    if (existing === 0) {
      await saveRolePermissions(rol, DEFAULT_PERMISSIONS[rol]);
    }
  }
}

// Mapeo de rutas a permisos de página
export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/": PERMISSIONS.pages.dashboard.code,
  "/planificacion": PERMISSIONS.pages.planificacion.code,
  "/mantenciones/pendientes": PERMISSIONS.pages.pendientes.code,
  "/mantenciones/nueva": PERMISSIONS.actions.crearMantencion.code,
  "/mantenciones/historial": PERMISSIONS.pages.historial.code,
  "/equipos": PERMISSIONS.pages.equipos.code,
  "/equipos/nuevo": PERMISSIONS.actions.crearEquipo.code,
  "/ubicaciones": PERMISSIONS.pages.ubicaciones.code,
  "/pautas": PERMISSIONS.pages.pautas.code,
  "/pautas/nueva": PERMISSIONS.actions.crearPauta.code,
  "/buscar-folio": PERMISSIONS.pages.buscarFolio.code,
  "/analitica": PERMISSIONS.pages.analitica.code,
  "/establecimientos": PERMISSIONS.pages.establecimientos.code,
  "/admin": PERMISSIONS.pages.admin.code,
  "/admin/usuarios": PERMISSIONS.actions.gestionarUsuarios.code,
  "/admin/roles": PERMISSIONS.actions.gestionarPermisos.code,
};

// Verificar permiso de ruta
export async function checkRoutePermission(
  rol: RolUsuario,
  pathname: string
): Promise<boolean> {
  // Admin siempre tiene acceso
  if (rol === "ADMINISTRADOR") {
    return true;
  }

  // Buscar permiso exacto o permiso padre
  let permission = ROUTE_PERMISSIONS[pathname];

  // Si no hay permiso exacto, buscar por ruta padre
  if (!permission) {
    const segments = pathname.split("/").filter(Boolean);
    while (segments.length > 0) {
      const parentPath = "/" + segments.join("/");
      permission = ROUTE_PERMISSIONS[parentPath];
      if (permission) break;
      segments.pop();
    }
  }

  // Si no hay permiso definido para esta ruta, permitir acceso
  if (!permission) {
    return true;
  }

  return hasPermission(rol, permission);
}
