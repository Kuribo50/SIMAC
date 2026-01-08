// =====================================================
// ARCHIVO DE COMPATIBILIDAD
// =====================================================
// Este archivo re-exporta todas las funciones de la nueva
// estructura modular para mantener compatibilidad con
// imports existentes.
//
// Nueva estructura en: src/app/actions/
//   - ubicaciones.ts  -> Funciones de ubicaciones
//   - tipos-equipo.ts -> Funciones de tipos de equipo
//   - equipos.ts      -> Funciones de equipos
//   - mantenciones.ts -> Funciones de mantenciones
//   - pautas.ts       -> Funciones de pautas
//   - checklists.ts   -> Funciones de checklists
//   - dashboard.ts    -> Funciones de dashboard y usuarios
//   - firmas.ts       -> Funciones de firmas digitales
//
// Nota: No usar "use server" aquí porque cada módulo
// ya tiene su propia directiva "use server"
// =====================================================

export * from "./actions/ubicaciones";
export * from "./actions/tipos-equipo";
export * from "./actions/equipos";
export * from "./actions/mantenciones";
export * from "./actions/pautas";
export * from "./actions/checklists";
export * from "./actions/dashboard";
export * from "./actions/firmas";
