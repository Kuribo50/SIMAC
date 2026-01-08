# Guía de Archivos y Carpetas del Proyecto

Documentación detallada de cada archivo y carpeta del proyecto.

## 📁 Estructura Raíz

### Archivos de Configuración

#### `.gitignore`

**Propósito**: Define qué archivos y carpetas Git debe ignorar.

**Contenido típico**:

- `/node_modules` - Dependencias
- `/.next/` - Build de Next.js
- `/out/` - Output de build estático
- `.env*` - Variables de entorno
- `*.tsbuildinfo` - Cache de TypeScript
- `/src/generated/prisma` - Cliente generado de Prisma

**Nota**: No versionar archivos sensibles ni generados automáticamente.

---

#### `package.json`

**Propósito**: Define dependencias, scripts y metadatos del proyecto.

**Scripts principales**:

- `dev`: Inicia servidor de desarrollo (`next dev`)
- `build`: Construye para producción (`next build`)
- `start`: Inicia servidor de producción (`next start`)
- `lint`: Ejecuta ESLint (`next lint`)

**Dependencias clave**:

- `next@15.3.2`: Framework principal
- `react@19.0.0`: Biblioteca UI
- `@prisma/client@6.0.0`: ORM cliente
- `typescript@5`: Compilador TypeScript

**Sección `prisma`**:

- `seed`: Script para poblar base de datos (`npx tsx prisma/seed.ts`)

---

#### `package-lock.json`

**Propósito**: Lock file de npm que asegura versiones exactas de dependencias.

**Importante**:

- Se genera automáticamente con `npm install`
- Debe versionarse para garantizar builds reproducibles
- No editar manualmente

---

#### `tsconfig.json`

**Propósito**: Configuración del compilador TypeScript.

**Configuraciones importantes**:

- `target: "ES2017"`: Versión de JavaScript objetivo
- `module: "esnext"`: Sistema de módulos
- `jsx: "preserve"`: Next.js procesa JSX
- `paths: { "@/*": ["./src/*"] }`: Alias de importación
- `strict: true`: Modo estricto habilitado

**Includes**:

- `next-env.d.ts`: Tipos de Next.js
- `**/*.ts`, `**/*.tsx`: Todos los archivos TypeScript
- `.next/types/**/*.ts`: Tipos generados

---

#### `next.config.ts`

**Propósito**: Configuración de Next.js.

**Estado actual**: Configuración básica (vacía).

**Posibles configuraciones futuras**:

- Rewrites/Redirects
- Headers personalizados
- Variables de entorno públicas
- Optimizaciones de imágenes
- Configuración de webpack

---

#### `next-env.d.ts`

**Propósito**: Referencias de tipos de Next.js (generado automáticamente).

**Contenido**:

- Referencias a tipos de Next.js
- Referencias a tipos de imágenes

**Importante**: No editar manualmente.

---

#### `eslint.config.mjs`

**Propósito**: Configuración de ESLint para validación de código.

**Configuración**:

- Extiende `eslint-config-next/core-web-vitals`
- Extiende `eslint-config-next/typescript`
- Ignora: `.next/`, `out/`, `build/`, `next-env.d.ts`

**Uso**: Ejecutar con `npm run lint`

---

#### `tailwind.config.mjs`

**Propósito**: Configuración de TailwindCSS.

**Configuraciones**:

- `darkMode: "class"`: Modo oscuro basado en clase HTML
- `content`: Rutas donde buscar clases Tailwind
- `borderRadius`: Personalización de bordes redondeados
- `theme.extend`: Extensiones del tema (vacío actualmente)

---

#### `postcss.config.mjs`

**Propósito**: Configuración de PostCSS.

**Plugins**:

- `@tailwindcss/postcss`: Plugin de TailwindCSS v4

**Uso**: Procesa CSS antes de enviarlo al navegador.

---

#### `tsconfig.tsbuildinfo`

**Propósito**: Cache de compilación incremental de TypeScript.

**Importante**:

- Generado automáticamente
- Mejora velocidad de compilación
- Incluido en `.gitignore`

---

#### `project_context.md`

**Propósito**: Documento de contexto y requisitos del proyecto.

**Contenido**:

- Contexto del proyecto (red de salud municipal)
- Referencias normativas (INS 3.1, EQ 1.2, etc.)
- Stack tecnológico deseado
- Módulos funcionales
- Prioridad de implementación

**Uso**: Referencia para desarrolladores nuevos.

---

## 📂 Carpetas Principales

### `.next/`

**Propósito**: Carpeta de build de Next.js (generada automáticamente).

**Contenido**:

- `cache/`: Cache de compilación
- `server/`: Código compilado del servidor
- `static/`: Assets estáticos
- `types/`: Tipos TypeScript generados

**Archivos importantes**:

- `build-manifest.json`: Manifest de build
- `app-build-manifest.json`: Manifest de app
- `react-loadable-manifest.json`: Manifest de carga lazy
- `trace`: Trazas de compilación

**Importante**:

- No versionar (en `.gitignore`)
- Se regenera en cada build
- Puede eliminarse y regenerarse

---

### `.next/cache/`

**Propósito**: Cache de compilación de Next.js.

**Contenido**:

- `.tsbuildinfo`: Cache de TypeScript
- `webpack/`: Cache de webpack
- `swc/`: Cache del compilador SWC

**Uso**: Acelera compilaciones subsecuentes.

---

### `.next/server/`

**Propósito**: Código compilado del servidor.

**Contenido**:

- `app/`: Rutas compiladas del App Router
- `middleware.js`: Middleware compilado
- `webpack-runtime.js`: Runtime de webpack
- Manifests varios

---

### `.next/static/`

**Propósito**: Assets estáticos generados.

**Contenido**:

- `chunks/`: Chunks de JavaScript
- `css/`: Archivos CSS compilados
- `media/`: Media optimizado

---

### `.next/types/`

**Propósito**: Tipos TypeScript generados para rutas.

**Contenido**:

- Tipos para cada ruta del App Router
- Tipos de parámetros de búsqueda
- Tipos de parámetros dinámicos

---

### `.vscode/`

**Propósito**: Configuración de Visual Studio Code.

**Contenido**:

- `settings.json`: Configuraciones del workspace

**Uso**: Configuraciones específicas del proyecto (formato, extensiones, etc.)

---

### `node_modules/`

**Propósito**: Dependencias instaladas de npm.

**Contenido**:

- Todas las dependencias listadas en `package.json`
- Dependencias transitivas

**Importante**:

- No versionar (en `.gitignore`)
- Regenerar con `npm install`
- Puede ser muy grande

---

### `prisma/`

**Propósito**: Configuración y migraciones de Prisma.

**Contenido**:

- `schema.prisma`: Modelo de datos
- `migrations/`: Migraciones de base de datos
- `seed.ts`: Script para poblar datos iniciales
- `dev.db`: Base de datos SQLite (desarrollo)

#### `prisma/schema.prisma`

**Propósito**: Define el modelo de datos.

**Contenido**:

- Generador: `prisma-client-js`
- Datasource: SQLite/PostgreSQL
- Modelos: User, Equipo, Mantencion, etc.
- Enums: EstadoEquipo, TipoMantencion, etc.
- Relaciones entre modelos

**Uso**:

- Editar para cambios en modelo
- Ejecutar `npx prisma migrate dev` después de cambios

#### `prisma/migrations/`

**Propósito**: Historial de cambios en base de datos.

**Estructura**:

```
migrations/
├── 20251201021100_init_nuevo/
│   └── migration.sql
├── 20251201030928_pautas_items_firmas_completo/
│   └── migration.sql
└── migration_lock.toml
```

**Uso**:

- Se crean automáticamente con `prisma migrate dev`
- Se aplican en producción con `prisma migrate deploy`

#### `prisma/seed.ts`

**Propósito**: Script para poblar base de datos con datos iniciales.

**Uso**: `npm run prisma:seed` o `npx tsx prisma/seed.ts`

---

### `public/`

**Propósito**: Archivos estáticos servidos directamente.

**Contenido**:

- `uploads/`: Imágenes subidas por usuarios
- `logo_disamtome.png`: Logo del sistema
- SVGs varios: `window.svg`, `vercel.svg`, etc.

**Uso**: Accesibles desde `/logo_disamtome.png` en el navegador.

---

### `scripts/`

**Propósito**: Scripts auxiliares del proyecto.

**Contenido**:

- `print-signatures.ts`: Script para imprimir firmas

**Uso**: Ejecutar con `npx tsx scripts/print-signatures.ts`

---

### `src/`

**Propósito**: Código fuente de la aplicación.

**Estructura principal**:

- `app/`: App Router de Next.js
- `components/`: Componentes reutilizables
- `lib/`: Utilidades y helpers
- `middleware.ts`: Middleware de Next.js

---

### `src/app/`

**Propósito**: App Router de Next.js (estructura de rutas).

**Estructura**:

- Cada carpeta es una ruta
- `page.tsx` = página de la ruta
- `layout.tsx` = layout de la ruta
- `route.ts` = API route

**Rutas principales**:

- `/` → `page.tsx` (Dashboard)
- `/equipos` → `equipos/page.tsx`
- `/mantenciones` → `mantenciones/page.tsx`
- `/pautas` → `pautas/page.tsx`
- `/planificacion` → `planificacion/page.tsx`
- `/admin` → `admin/page.tsx`

---

### `src/app/actions/`

**Propósito**: Server Actions organizadas por dominio.

**Archivos**:

- `analytics.ts`: Estadísticas
- `audit.ts`: Auditoría
- `auth.ts`: Autenticación
- `checklists.ts`: Checklists
- `dashboard.ts`: Dashboard
- `equipos.ts`: Equipos
- `firmas.ts`: Firmas
- `mantenciones.ts`: Mantenciones
- `pautas.ts`: Pautas
- `permissions.ts`: Permisos
- `index.ts`: Exports centralizados

**Uso**: Importar desde componentes con `'use server'`

---

### `src/app/api/`

**Propósito**: API Routes (endpoints REST).

**Estructura**:

- `equipos/search/route.ts`: Búsqueda de equipos
- `mantenciones/*/route.ts`: Endpoints de mantenciones
- `logs/stream/route.ts`: Streaming de logs (SSE)

**Uso**: Accesibles desde `/api/equipos/search`, etc.

---

### `src/app/components/`

**Propósito**: Componentes compartidos del App Router.

**Estructura**:

- `ui/`: Componentes UI base (Button, Card, etc.)
- `dashboard/`: Componentes del dashboard
- Otros componentes específicos

---

### `src/lib/`

**Propósito**: Utilidades y helpers reutilizables.

**Archivos**:

- `prisma.ts`: Cliente singleton de Prisma
- `auth.ts`: Funciones de autenticación
- `permissions.ts`: Validación de permisos
- `audit.ts`: Registro de auditoría
- `utils.ts`: Utilidades generales
- `revalidation.ts`: Revalidación de cache

---

### `src/middleware.ts`

**Propósito**: Middleware de Next.js que se ejecuta en cada request.

**Funcionalidad actual**:

- Agrega header `x-pathname` con la ruta actual
- Puede validar autenticación (si se implementa)

**Configuración**:

- `matcher`: Define qué rutas procesa el middleware

---

## 📄 Archivos Específicos Importantes

### `src/app/layout.tsx`

**Propósito**: Layout raíz de la aplicación.

**Contenido**:

- Metadata de la aplicación
- Font (Inter de Google Fonts)
- ThemeProvider (tema oscuro/claro)
- Toaster (notificaciones)
- Estilos globales

---

### `src/app/page.tsx`

**Propósito**: Página principal (Dashboard).

**Contenido**:

- Estadísticas principales (KPIs)
- Gráficos de actividad
- Mantenciones recientes
- Accesos rápidos
- Widgets informativos

---

### `src/app/globals.css`

**Propósito**: Estilos globales de la aplicación.

**Contenido**:

- Reset CSS
- Variables CSS
- Estilos base de Tailwind
- Estilos personalizados

---

### `src/lib/prisma.ts`

**Propósito**: Cliente singleton de Prisma.

**Funcionalidad**:

- Crea una única instancia de PrismaClient
- Reutiliza en desarrollo (hot reload)
- Previene múltiples conexiones

---

## 🔍 Archivos de Build

### `.next/build-manifest.json`

**Propósito**: Manifest de archivos del build.

**Contenido**:

- Lista de archivos polyfill
- Archivos de desarrollo
- Archivos principales
- Páginas compiladas

---

### `.next/app-build-manifest.json`

**Propósito**: Manifest de la aplicación.

**Contenido**:

- Chunks de JavaScript por ruta
- Archivos CSS por ruta
- Dependencias de cada página

---

### `.next/react-loadable-manifest.json`

**Propósito**: Manifest de componentes lazy-loaded.

**Contenido**:

- Componentes cargados bajo demanda
- Chunks asociados

---

### `.next/trace`

**Propósito**: Trazas de compilación de Next.js.

**Contenido**:

- Métricas de tiempo de compilación
- Información de webpack
- Trazas de hot reload

**Uso**: Análisis de rendimiento de build.

---

## 📝 Notas Importantes

### Archivos que NO versionar

- `.next/` (build generado)
- `node_modules/` (dependencias)
- `.env*` (variables de entorno)
- `*.tsbuildinfo` (cache)
- `prisma/dev.db` (base de datos local)

### Archivos que SÍ versionar

- `package.json` y `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `prisma/schema.prisma`
- `prisma/migrations/`
- Todo el código en `src/`

### Archivos de configuración críticos

1. `package.json`: Dependencias y scripts
2. `tsconfig.json`: Configuración TypeScript
3. `prisma/schema.prisma`: Modelo de datos
4. `.env`: Variables de entorno (crear desde `.env.example`)

---

**Última actualización**: Diciembre 2024
