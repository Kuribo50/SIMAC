// Tipos de acciones de auditoría
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXECUTE"
  | "SIGN"
  | "CANCEL"
  | "COMPLETE"
  | "ASSIGN"
  | "CHANGE_ROLE"
  | "CHANGE_STATUS"
  | "RESET_PASSWORD"
  | "CHANGE_PERMISSIONS";

// Entidades del sistema
export type AuditEntity =
  | "User"
  | "Mantencion"
  | "Equipo"
  | "Pauta"
  | "Ubicacion"
  | "TipoEquipo"
  | "Firma"
  | "Permisos"
  | "Session";

// Descripciones legibles de las acciones
export const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Creó",
  UPDATE: "Actualizó",
  DELETE: "Eliminó",
  LOGIN: "Inició sesión",
  LOGOUT: "Cerró sesión",
  EXECUTE: "Ejecutó",
  SIGN: "Firmó",
  CANCEL: "Canceló",
  COMPLETE: "Completó",
  ASSIGN: "Asignó",
  CHANGE_ROLE: "Cambió rol de",
  CHANGE_STATUS: "Cambió estado de",
  RESET_PASSWORD: "Reinició contraseña de",
  CHANGE_PERMISSIONS: "Cambió permisos de",
};

// Descripciones legibles de las entidades
export const ENTITY_LABELS: Record<AuditEntity, string> = {
  User: "Usuario",
  Mantencion: "Mantención",
  Equipo: "Equipo",
  Pauta: "Pauta",
  Ubicacion: "Ubicación",
  TipoEquipo: "Tipo de Equipo",
  Firma: "Firma",
  Permisos: "Permisos",
  Session: "Sesión",
};

// Colores para badges de acciones
export const ACTION_COLORS: Record<AuditAction, { bg: string; text: string }> =
  {
    CREATE: { bg: "bg-emerald-100", text: "text-emerald-700" },
    UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
    DELETE: { bg: "bg-red-100", text: "text-red-700" },
    LOGIN: { bg: "bg-purple-100", text: "text-purple-700" },
    LOGOUT: { bg: "bg-zinc-100", text: "text-zinc-700" },
    EXECUTE: { bg: "bg-amber-100", text: "text-amber-700" },
    SIGN: { bg: "bg-indigo-100", text: "text-indigo-700" },
    CANCEL: { bg: "bg-orange-100", text: "text-orange-700" },
    COMPLETE: { bg: "bg-green-100", text: "text-green-700" },
    ASSIGN: { bg: "bg-cyan-100", text: "text-cyan-700" },
    CHANGE_ROLE: { bg: "bg-violet-100", text: "text-violet-700" },
    CHANGE_STATUS: { bg: "bg-yellow-100", text: "text-yellow-700" },
    RESET_PASSWORD: { bg: "bg-pink-100", text: "text-pink-700" },
    CHANGE_PERMISSIONS: { bg: "bg-teal-100", text: "text-teal-700" },
  };
