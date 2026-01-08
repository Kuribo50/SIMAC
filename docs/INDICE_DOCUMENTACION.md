# Índice de Documentación - Sistema de Mantenciones CAR

Guía rápida para navegar toda la documentación del proyecto.

## 📚 Documentos Disponibles

### 1. [README.md](./README.md) - Documentación Principal

**Para**: Nuevos desarrolladores, usuarios, overview general

**Contenido**:

- Descripción del proyecto
- Características principales
- Stack tecnológico
- Instalación y configuración
- Uso básico
- Módulos del sistema
- Base de datos
- Autenticación y permisos
- Despliegue

**Cuándo leer**: Primero, para entender qué es el proyecto y cómo empezar.

---

### 2. [DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md) - Documentación Técnica

**Para**: Desarrolladores que necesitan entender la arquitectura

**Contenido**:

- Arquitectura del sistema
- Configuración de archivos
- Estructura de carpetas detallada
- Modelo de datos
- Server Actions
- API Routes
- Componentes
- Sistema de autenticación
- Sistema de permisos
- Auditoría
- Flujos principales
- Optimizaciones

**Cuándo leer**: Cuando necesites entender cómo funciona internamente el sistema.

---

### 3. [GUIA_ARCHIVOS.md](./GUIA_ARCHIVOS.md) - Guía de Archivos

**Para**: Desarrolladores que necesitan entender cada archivo

**Contenido**:

- Explicación de cada archivo de configuración
- Explicación de cada carpeta
- Propósito de cada archivo
- Contenido típico
- Uso y notas importantes

**Cuándo leer**: Cuando necesites entender qué hace un archivo específico o dónde encontrar algo.

---

### 4. [project_context.md](./project_context.md) - Contexto del Proyecto

**Para**: Entender los requisitos y contexto de negocio

**Contenido**:

- Contexto del proyecto (red de salud municipal)
- Referencias normativas
- Stack tecnológico deseado
- Módulos funcionales detallados
- Prioridad de implementación

**Cuándo leer**: Para entender el contexto de negocio y requisitos.

---

## 🗺️ Guía de Lectura por Rol

### Nuevo Desarrollador

1. **README.md** - Entender el proyecto
2. **project_context.md** - Contexto de negocio
3. **DOCUMENTACION_TECNICA.md** - Arquitectura
4. **GUIA_ARCHIVOS.md** - Referencia cuando necesites

### Desarrollador Experimentado

1. **DOCUMENTACION_TECNICA.md** - Arquitectura y flujos
2. **GUIA_ARCHIVOS.md** - Referencia rápida
3. **README.md** - Solo si necesita recordar algo

### Administrador/DevOps

1. **README.md** - Sección de instalación y despliegue
2. **GUIA_ARCHIVOS.md** - Archivos de configuración
3. **DOCUMENTACION_TECNICA.md** - Sección de optimizaciones

### Product Owner/Stakeholder

1. **project_context.md** - Requisitos y contexto
2. **README.md** - Características y módulos

---

## 🔍 Búsqueda Rápida

### ¿Cómo instalar el proyecto?

→ [README.md - Instalación](./README.md#-instalación)

### ¿Cómo funciona la autenticación?

→ [DOCUMENTACION_TECNICA.md - Sistema de Autenticación](./DOCUMENTACION_TECNICA.md#-sistema-de-autenticación)

### ¿Qué hace el archivo X?

→ [GUIA_ARCHIVOS.md](./GUIA_ARCHIVOS.md) - Buscar el archivo

### ¿Cómo se estructura el código?

→ [DOCUMENTACION_TECNICA.md - Estructura de Carpetas](./DOCUMENTACION_TECNICA.md#-estructura-de-carpetas-detallada)

### ¿Cuál es el modelo de datos?

→ [DOCUMENTACION_TECNICA.md - Modelo de Datos](./DOCUMENTACION_TECNICA.md#-modelo-de-datos)

### ¿Cómo crear una nueva mantención?

→ [README.md - Módulos - Ejecución de Mantenciones](./README.md#3-ejecución-de-mantenciones-mantenciones)

### ¿Cómo funcionan los permisos?

→ [DOCUMENTACION_TECNICA.md - Sistema de Permisos](./DOCUMENTACION_TECNICA.md#-sistema-de-permisos)

### ¿Cómo desplegar a producción?

→ [README.md - Despliegue](./README.md#-despliegue)

### ¿Qué referencias normativas cumple?

→ [README.md - Referencias Normativas](./README.md#-referencias-normativas)

---

## 📋 Checklist de Onboarding

Para nuevos desarrolladores:

- [ ] Leer README.md completo
- [ ] Leer project_context.md
- [ ] Configurar entorno local (seguir README.md)
- [ ] Explorar estructura de carpetas (GUIA_ARCHIVOS.md)
- [ ] Entender modelo de datos (DOCUMENTACION_TECNICA.md)
- [ ] Revisar Server Actions principales
- [ ] Revisar componentes principales
- [ ] Hacer primera modificación pequeña
- [ ] Entender sistema de permisos
- [ ] Entender sistema de auditoría

---

## 🔗 Enlaces Útiles

### Documentación Externa

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Herramientas

- [Prisma Studio](https://www.prisma.io/studio) - GUI de base de datos
- [Next.js DevTools](https://nextjs.org/docs/app/building-your-application/configuring/devtools)

---

## 📝 Mantenimiento de Documentación

### Cuándo actualizar

**README.md**:

- Nuevas características
- Cambios en instalación
- Nuevos módulos

**DOCUMENTACION_TECNICA.md**:

- Cambios en arquitectura
- Nuevos patrones
- Cambios en flujos

**GUIA_ARCHIVOS.md**:

- Nuevos archivos importantes
- Cambios en estructura de carpetas
- Nuevas configuraciones

### Convenciones

- Usar Markdown estándar
- Incluir ejemplos de código cuando sea útil
- Mantener enlaces actualizados
- Actualizar fecha de "última actualización"

---

## ❓ Preguntas Frecuentes

### ¿Dónde está el código de autenticación?

→ `src/lib/auth.ts` y `src/app/actions/auth.ts`

### ¿Dónde están las Server Actions?

→ `src/app/actions/`

### ¿Dónde está el modelo de datos?

→ `prisma/schema.prisma`

### ¿Cómo agrego un nuevo módulo?

1. Crear carpeta en `src/app/`
2. Crear `page.tsx`
3. Crear Server Actions en `src/app/actions/`
4. Actualizar documentación

### ¿Cómo agrego un nuevo permiso?

1. Agregar en `RolePermission` (base de datos)
2. Actualizar `src/lib/permissions.ts`
3. Usar en componentes con `PermissionGuard`

---

**Última actualización**: Diciembre 2024
