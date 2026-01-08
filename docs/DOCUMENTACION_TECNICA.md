# Documentación Técnica - Sistema de Mantenciones CAR

Documentación detallada de la arquitectura, configuración y estructura técnica del proyecto.

## 📋 Índice

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Configuración de Archivos](#configuración-de-archivos)
- [Estructura de Carpetas Detallada](#estructura-de-carpetas-detallada)
- [Modelo de Datos](#modelo-de-datos)
- [Server Actions](#server-actions)
- [API Routes](#api-routes)
- [Componentes](#componentes)
- [Sistema de Autenticación](#sistema-de-autenticación)
- [Sistema de Permisos](#sistema-de-permisos)
- [Auditoría](#auditoría)

## 🏗 Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js 15)            │
│  ┌───────────────────────────────────┐  │
│  │  React 19 + TypeScript             │  │
│  │  TailwindCSS 4                     │  │
│  │  Framer Motion (animaciones)       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Backend (Next.js App Router)       │
│  ┌───────────────────────────────────┐  │
│  │  Server Actions                    │  │
│  │  API Routes                        │  │
│  │  Middleware                        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Capa de Datos                   │
│  ┌───────────────────────────────────┐  │
│  │  Prisma ORM                        │  │
│  │  SQLite (dev) / PostgreSQL (prod) │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario** → Interactúa con UI (React)
2. **UI** → Llama Server Action o API Route
3. **Server Action/API** → Valida permisos y autenticación
4. **Prisma Client** → Ejecuta query en base de datos
5. **Base de Datos** → Retorna datos
6. **Server Action** → Procesa y retorna resultado
7. **UI** → Actualiza interfaz

## ⚙️ Configuración de Archivos

### `package.json`

**Dependencias principales:**

- `next@15.3.2`: Framework principal
- `react@19.0.0`: Biblioteca UI
- `@prisma/client@6.0.0`: Cliente ORM
- `tailwindcss@4`: Framework CSS
- `typescript@5`: Tipado estático

**Scripts:**

- `dev`: Desarrollo con hot-reload
- `build`: Compilación para producción
- `start`: Servidor de producción
- `lint`: Validación de código

### `tsconfig.json`

**Configuración TypeScript:**

- Target: ES2017
- Module: ESNext
- JSX: preserve (Next.js lo procesa)
- Paths: `@/*` → `./src/*`
- Strict mode habilitado

**Características:**

- Incremental compilation
- Skip lib check para mejor rendimiento
- Module resolution: bundler (Next.js)

### `next.config.ts`

**Configuración Next.js:**

- Actualmente básica (sin configuraciones especiales)
- Listo para agregar:
  - Rewrites/Redirects
  - Headers personalizados
  - Variables de entorno públicas
  - Optimizaciones de imágenes

### `tailwind.config.mjs`

**Configuración Tailwind:**

- Dark mode: `class` (basado en clase HTML)
- Content paths: `./src/**/*.{js,ts,jsx,tsx}`
- Border radius personalizado (todos en 0px excepto `full`)
- Sin plugins adicionales

### `postcss.config.mjs`

**Configuración PostCSS:**

- Plugin: `@tailwindcss/postcss` (TailwindCSS v4)
- Procesa CSS con Tailwind

### `eslint.config.mjs`

**Configuración ESLint:**

- Extiende `eslint-config-next`
- Incluye:
  - `core-web-vitals`: Reglas de rendimiento
  - `typescript`: Reglas de TypeScript
- Ignora: `.next/`, `out/`, `build/`, `next-env.d.ts`

### `prisma/schema.prisma`

**Configuración Prisma:**

- Provider: `prisma-client-js`
- Datasource: SQLite (desarrollo)
- URL: Variable de entorno `DATABASE_URL`

**Modelos principales:**

- 15+ modelos de datos
- Relaciones bien definidas
- Índices para optimización
- Enums para valores constantes

## 📂 Estructura de Carpetas Detallada

### `/src/app`

Estructura del App Router de Next.js:

```
app/
├── actions/              # Server Actions organizadas por dominio
│   ├── analytics.ts      # Estadísticas y reportes
│   ├── audit.ts          # Logs de auditoría
│   ├── auth.ts           # Autenticación
│   ├── checklists.ts     # Gestión de checklists
│   ├── dashboard.ts      # Datos del dashboard
│   ├── equipos.ts        # CRUD de equipos
│   ├── firmas.ts         # Gestión de firmas
│   ├── mantenciones.ts   # CRUD de mantenciones
│   ├── pautas.ts         # CRUD de pautas
│   └── ...
│
├── admin/                # Panel de administración
│   ├── logs/            # Logs en tiempo real
│   ├── parametros/       # Configuración del sistema
│   ├── roles/           # Gestión de roles
│   └── usuarios/        # Gestión de usuarios
│
├── api/                  # API Routes (REST endpoints)
│   ├── equipos/         # Endpoints de equipos
│   ├── logs/            # Streaming de logs
│   └── mantenciones/    # Endpoints de mantenciones
│
├── components/           # Componentes compartidos
│   ├── dashboard/       # Componentes del dashboard
│   ├── ui/              # Componentes UI base
│   └── ...              # Otros componentes
│
├── equipos/              # Módulo de equipos
│   ├── [id]/            # Página dinámica de equipo
│   │   ├── editar/      # Edición de equipo
│   │   ├── ejecutar/    # Ejecutar mantención
│   │   └── historial/   # Historial de mantenciones
│   ├── nuevo/           # Crear nuevo equipo
│   └── page.tsx         # Lista de equipos
│
├── mantenciones/         # Módulo de mantenciones
│   ├── [id]/            # Página dinámica de mantención
│   │   ├── ejecutar/    # Ejecutar checklist
│   │   └── visualizar/  # Ver mantención completa
│   ├── nueva/           # Crear nueva mantención
│   ├── historial/       # Historial completo
│   └── pendientes/      # Mantenciones pendientes
│
├── pautas/               # Módulo de pautas
│   ├── [id]/            # Página de pauta
│   │   └── editar/      # Editar pauta
│   ├── nueva/           # Crear nueva pauta
│   └── page.tsx         # Lista de pautas
│
├── planificacion/        # Calendario y programación
│   └── components/      # Componentes del calendario
│
└── ...                   # Otros módulos
```

### `/src/lib`

Utilidades y helpers:

- `prisma.ts`: Cliente singleton de Prisma
- `auth.ts`: Funciones de autenticación
- `permissions.ts`: Validación de permisos
- `audit.ts`: Registro de auditoría
- `utils.ts`: Utilidades generales
- `revalidation.ts`: Revalidación de cache

### `/src/components`

Componentes reutilizables fuera del App Router:

- `theme-provider.tsx`: Proveedor de tema (dark/light)

## 🗄️ Modelo de Datos

### Relaciones Principales

```
User
  ├── mantenciones (realizadoPor)
  ├── mantencionesCreadas (createdBy)
  ├── mantencionesEditadas (updatedBy)
  ├── firmas (MaintenanceSignature)
  └── notificaciones

Equipo
  ├── ubicacion (Ubicacion)
  ├── tipoEquipo (TipoEquipo)
  ├── pautaAsignada (PautaMantenimiento)
  ├── mantenciones
  └── checklistRecords

Mantencion
  ├── equipo (Equipo)
  ├── pauta (PautaMantenimiento)
  ├── realizadoPor (User)
  ├── createdBy (User)
  ├── updatedBy (User)
  ├── respuestas (MantencionChecklistResponse[])
  ├── firmas (MaintenanceSignature[])
  └── notificaciones

PautaMantenimiento
  ├── tipoEquipo (TipoEquipo)
  ├── items (PautaItem[])
  ├── mantenciones
  └── equiposAsignados
```

### Índices Estratégicos

Los índices están definidos en el schema para optimizar consultas frecuentes:

- `Equipo`: `ubicacionId`, `tipoEquipoId`, `estado`, `pautaAsignadaId`
- `Mantencion`: `equipoId`, `fecha`, `estadoMantencion`, `tipoMantencion`
- `AuditLog`: `userId`, `entity`, `action`, `createdAt`
- `Notificacion`: `userId`, `leida`, `tipo`, `createdAt`

## 🔧 Server Actions

### Estructura

Las Server Actions están en `src/app/actions/` y siguen el patrón:

```typescript
"use server";

export async function nombreAccion(params) {
  // 1. Validar autenticación
  // 2. Validar permisos
  // 3. Validar datos
  // 4. Ejecutar operación
  // 5. Registrar auditoría
  // 6. Retornar resultado
}
```

### Ejemplos

**`equipos.ts`:**

- `createEquipo`: Crear equipo
- `updateEquipo`: Actualizar equipo
- `deleteEquipo`: Eliminar equipo
- `getEquipos`: Listar equipos
- `getEquipoById`: Obtener equipo por ID

**`mantenciones.ts`:**

- `createMantencion`: Crear mantención
- `updateMantencion`: Actualizar mantención
- `completeMantencion`: Completar mantención
- `getMantenciones`: Listar mantenciones
- `getMantencionById`: Obtener mantención por ID

**`pautas.ts`:**

- `createPauta`: Crear pauta
- `updatePauta`: Actualizar pauta
- `getPautas`: Listar pautas
- `getPautaById`: Obtener pauta por ID

## 🌐 API Routes

### Estructura

Las API Routes están en `src/app/api/` y siguen el patrón REST:

```typescript
export async function GET(request: Request) {
  // Manejar GET
}

export async function POST(request: Request) {
  // Manejar POST
}
```

### Endpoints Principales

**`/api/equipos/search`:**

- GET: Búsqueda de equipos

**`/api/mantenciones/buscar-folio`:**

- GET: Buscar mantención por folio

**`/api/mantenciones/completar`:**

- POST: Completar mantención

**`/api/mantenciones/firmar`:**

- POST: Agregar firma a mantención

**`/api/logs/stream`:**

- GET: Streaming de logs en tiempo real (SSE)

## 🧩 Componentes

### Componentes UI Base (`/src/app/components/ui/`)

Componentes reutilizables con estilos consistentes:

- `Button`: Botón con variantes
- `Card`: Tarjeta contenedora
- `Input`: Campo de entrada
- `Modal`: Modal/dialog
- `Table`: Tabla de datos
- `Badge`: Badge/etiqueta
- `EmptyState`: Estado vacío
- `StatCard`: Tarjeta de estadística
- `PageHeader`: Encabezado de página

### Componentes de Dominio

**Dashboard:**

- `DashboardCharts`: Gráficos del dashboard
- `DashboardFilter`: Filtros del dashboard

**Mantenciones:**

- `ChecklistExecution`: Ejecución de checklist
- `MaintenanceForm`: Formulario de mantención
- `SignatureModal`: Modal de firmas
- `ExportButton`: Exportar a PDF

**Equipos:**

- `EquipmentGrid`: Grilla de equipos
- `EquipmentFilters`: Filtros de equipos
- `BulkImportButton`: Importación masiva

## 🔐 Sistema de Autenticación

### Implementación

El sistema de autenticación está en:

- `src/lib/auth.ts`: Funciones de autenticación
- `src/app/actions/auth.ts`: Server Actions de auth

### Flujo

1. Usuario ingresa credenciales
2. Validación en servidor
3. Creación de sesión (si aplica)
4. Redirección según rol

### Middleware

`src/middleware.ts`:

- Intercepta requests
- Agrega `x-pathname` header
- Puede validar autenticación (si se implementa)

## 🛡️ Sistema de Permisos

### Estructura

**Modelo `RolePermission`:**

- `rol`: RolUsuario (VISUALIZADOR, REGISTRADOR, ADMINISTRADOR)
- `permiso`: Código del permiso (ej: "page:dashboard")
- `activo`: Si el permiso está activo

### Validación

**`src/lib/permissions.ts`:**

- `hasPermission(user, permission)`: Verifica permiso
- `requirePermission(user, permission)`: Lanza error si no tiene permiso

**`src/app/components/PermissionGuard.tsx`:**

- Componente que protege contenido según permisos
- Renderiza contenido solo si tiene permiso

### Permisos Comunes

- `page:dashboard`
- `page:equipos`
- `page:mantenciones`
- `page:admin`
- `action:crear_mantencion`
- `action:editar_mantencion`
- `action:completar_mantencion`
- `action:gestionar_usuarios`

## 📊 Auditoría

### Modelo `AuditLog`

Registra todas las acciones importantes:

- `userId`: Usuario que realizó la acción
- `action`: Tipo de acción (CREATE, UPDATE, DELETE, etc.)
- `entity`: Entidad afectada (Mantencion, Equipo, etc.)
- `entityId`: ID de la entidad
- `details`: JSON con detalles adicionales
- `ipAddress`: IP del usuario
- `createdAt`: Timestamp

### Registro

**`src/lib/audit.ts`:**

- `logAction()`: Registra acción en auditoría
- `getAuditLogs()`: Obtiene logs
- Constantes de acciones en `src/lib/audit-constants.ts`

### Visualización

**`/admin/logs`:**

- Tabla de logs en tiempo real
- Filtros por usuario, acción, entidad
- Streaming con Server-Sent Events

## 🔄 Flujos Principales

### Crear Mantención

1. Usuario selecciona equipo en `/equipos`
2. Click en "Ejecutar Mantención"
3. Sistema carga pauta asignada al equipo
4. Usuario completa checklist
5. Usuario agrega observaciones
6. Usuario firma (técnico)
7. Responsable firma
8. Sistema marca como completada
9. Genera folio automático
10. Registra en auditoría

### Programar Mantención

1. Usuario va a `/planificacion`
2. Selecciona fecha en calendario
3. Selecciona equipo
4. Selecciona pauta
5. Sistema crea mantención con estado PENDIENTE
6. Aparece en calendario
7. Genera notificación

### Editar Mantención Completada

1. Admin accede a mantención completada
2. Sistema verifica permisos de admin
3. Admin edita campos permitidos
4. Sistema registra:
   - `editedAfterCompletionAt`
   - `editedAfterCompletionBy`
   - Log en auditoría
5. Mantiene trazabilidad completa

## 🚀 Optimizaciones

### Base de Datos

- Índices en campos frecuentemente consultados
- Relaciones optimizadas
- Queries selectivas (no SELECT \*)

### Frontend

- Server Components por defecto
- Client Components solo cuando necesario
- Lazy loading de componentes pesados
- Optimización de imágenes (Next.js Image)

### Cache

- Revalidación estratégica con `revalidatePath`
- Cache de datos estáticos
- ISR (Incremental Static Regeneration) donde aplica

## 📝 Notas de Desarrollo

### Convenciones

- **Nombres de archivos**: kebab-case para rutas, PascalCase para componentes
- **Server Actions**: Prefijo descriptivo (`create`, `update`, `get`, `delete`)
- **Componentes**: PascalCase, descriptivos
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Mejores Prácticas

1. Siempre validar permisos en Server Actions
2. Registrar acciones importantes en auditoría
3. Usar tipos TypeScript estrictos
4. Manejar errores apropiadamente
5. Documentar funciones complejas
6. Mantener componentes pequeños y reutilizables

---

**Última actualización**: Diciembre 2024
