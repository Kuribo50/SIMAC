# Sistema de Gestión de Mantenciones CAR

[![GitHub](https://img.shields.io/github/license/TU_USUARIO/mantenciones-car)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/TU_USUARIO/mantenciones-car)](https://github.com/TU_USUARIO/mantenciones-car)
[![GitHub repo size](https://img.shields.io/github/repo-size/TU_USUARIO/mantenciones-car)](https://github.com/TU_USUARIO/mantenciones-car)

Sistema web para la gestión de mantenciones preventivas y correctivas de equipos e instalaciones en la red de salud municipal (CESFAM Dr. Alberto Reyes y dependencias).

> **Nota**: Reemplaza `TU_USUARIO` en los badges con tu usuario de GitHub después de publicar el repositorio.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Módulos del Sistema](#módulos-del-sistema)
- [Base de Datos](#base-de-datos)
- [Autenticación y Permisos](#autenticación-y-permisos)
- [Desarrollo](#desarrollo)
- [Despliegue](#despliegue)

## 📖 Descripción

Sistema completo para reemplazar planillas y pautas en papel de mantención preventiva por un sistema web único que permite:

- Control de mantenciones preventivas y correctivas
- Gestión de equipos e instalaciones críticas
- Generación de evidencia trazable compatible con ISO 9001:2015
- Programación anual de mantenciones (Carta Gantt)
- Firmas digitales para validación de mantenciones
- Dashboard con métricas y reportes

**Contexto:** Red de salud municipal (CESFAM Dr. Alberto Reyes y dependencias: CECOSF, SAR, etc.)

## ✨ Características

- ✅ **Gestión completa de equipos e instalaciones**
- ✅ **Plantillas de pautas de mantención configurables**
- ✅ **Ejecución de mantenciones con checklist interactivo**
- ✅ **Firmas digitales manuscritas**
- ✅ **Programación anual con vista de calendario**
- ✅ **Dashboard con métricas en tiempo real**
- ✅ **Sistema de notificaciones**
- ✅ **Auditoría completa de acciones**
- ✅ **Exportación a PDF/Excel**
- ✅ **Búsqueda avanzada por folio**
- ✅ **Roles y permisos granulares**
- ✅ **Tema oscuro/claro**

## 🛠 Stack Tecnológico

### Frontend

- **Next.js 15.3.2** (App Router)
- **React 19**
- **TypeScript 5**
- **TailwindCSS 4** (con PostCSS)
- **Framer Motion** (animaciones)
- **Lucide React** (iconos)
- **Sonner** (notificaciones toast)
- **next-themes** (tema oscuro/claro)

### Backend

- **Next.js API Routes** (Server Actions)
- **Prisma 6.0.0** (ORM)
- **SQLite** (desarrollo) / PostgreSQL (producción)

### Utilidades

- **date-fns** (manejo de fechas)
- **react-big-calendar** (calendario)
- **recharts** (gráficos)
- **xlsx** (exportación Excel)
- **react-signature-canvas** (firmas digitales)

## 📁 Estructura del Proyecto

```
mantenciones-car/
├── .next/                    # Build de Next.js (generado)
├── .vscode/                  # Configuración de VS Code
├── node_modules/            # Dependencias
├── prisma/                   # Schema y migraciones de Prisma
│   ├── schema.prisma        # Modelo de datos
│   ├── migrations/          # Migraciones de base de datos
│   ├── seed.ts              # Script de seeding
│   └── dev.db               # Base de datos SQLite (desarrollo)
├── public/                  # Archivos estáticos
│   ├── uploads/             # Imágenes subidas
│   └── logo_disamtome.png   # Logo
├── scripts/                 # Scripts auxiliares
│   └── print-signatures.ts  # Script para imprimir firmas
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── actions/        # Server Actions
│   │   ├── admin/           # Panel de administración
│   │   ├── analitica/       # Dashboard de analítica
│   │   ├── api/             # API Routes
│   │   ├── buscar-folio/    # Búsqueda por folio
│   │   ├── components/      # Componentes compartidos
│   │   ├── equipos/         # Módulo de equipos
│   │   ├── establecimientos/# Gestión de establecimientos
│   │   ├── login/           # Página de login
│   │   ├── mantenciones/    # Módulo de mantenciones
│   │   ├── notificaciones/  # Sistema de notificaciones
│   │   ├── pautas/          # Gestión de pautas
│   │   ├── planificacion/   # Calendario y programación
│   │   ├── ubicaciones/     # Gestión de ubicaciones
│   │   ├── layout.tsx       # Layout principal
│   │   ├── page.tsx         # Página principal (Dashboard)
│   │   └── globals.css      # Estilos globales
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Utilidades y helpers
│   │   ├── prisma.ts        # Cliente de Prisma
│   │   ├── auth.ts          # Autenticación
│   │   ├── permissions.ts   # Sistema de permisos
│   │   ├── audit.ts         # Auditoría
│   │   └── utils.ts         # Utilidades generales
│   └── middleware.ts        # Middleware de Next.js
├── .gitignore               # Archivos ignorados por Git
├── eslint.config.mjs        # Configuración de ESLint
├── next.config.ts           # Configuración de Next.js
├── package.json             # Dependencias y scripts
├── postcss.config.mjs       # Configuración de PostCSS
├── tailwind.config.mjs     # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
└── project_context.md       # Contexto y requisitos del proyecto
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 20+
- npm o yarn
- Git

### Pasos

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd mantenciones-car
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar base de datos**

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos de ejemplo
npm run prisma:seed
```

5. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

El sistema estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="file:./prisma/dev.db"

# Autenticación (si se usa NextAuth)
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# (Opcional) Para producción con PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/mantenciones"
```

### Configuración de Prisma

El archivo `prisma/schema.prisma` define el modelo de datos. Para cambios:

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy
```

### Configuración de Tailwind

El archivo `tailwind.config.mjs` contiene la configuración de estilos. El proyecto usa:

- Modo oscuro/claro
- Bordes redondeados personalizados
- Colores del sistema

## 📱 Uso

### Acceso al Sistema

1. Navegar a `http://localhost:3000`
2. Iniciar sesión con credenciales (si está configurado)
3. El dashboard muestra métricas y accesos rápidos

### Flujo Principal

1. **Registrar Equipos**: Ir a `/equipos/nuevo`
2. **Crear Pautas**: Ir a `/pautas/nueva`
3. **Programar Mantención**: Ir a `/mantenciones/nueva`
4. **Ejecutar Mantención**: Desde `/mantenciones/[id]/ejecutar`
5. **Firmar Mantención**: Agregar firmas digitales
6. **Completar**: Marcar como completada

## 🎯 Módulos del Sistema

### 1. Catastro de Equipos (`/equipos`)

**Funcionalidades:**

- Registro de equipos e instalaciones
- Asignación de ubicaciones y tipos
- Gestión de estados (operativo, fuera de servicio, etc.)
- Asignación de pautas por defecto
- Importación masiva desde Excel
- Historial de mantenciones por equipo

**Componentes principales:**

- `EquipmentGrid`: Vista de grilla de equipos
- `EquipmentFilters`: Filtros avanzados
- `BulkImportButton`: Importación masiva
- `ScheduleButton`: Programar mantención

### 2. Plantillas de Pautas (`/pautas`)

**Funcionalidades:**

- Crear plantillas de checklist de mantención
- Definir items ordenados
- Marcar items como obligatorios
- Control de versiones
- Asociar a tipos de equipo

**Componentes principales:**

- `PautasList`: Lista de pautas
- `PautaItemsEditor`: Editor de items
- `EditPautaForm`: Formulario de edición

### 3. Ejecución de Mantenciones (`/mantenciones`)

**Funcionalidades:**

- Crear registro de mantención
- Ejecutar checklist interactivo
- Agregar comentarios por item
- Guardar borradores
- Completar y cerrar mantención
- Firmas digitales (técnico, responsable, supervisor)
- Exportación a PDF

**Estados:**

- `PENDIENTE`: Programada pero no iniciada
- `EN_PROCESO`: En ejecución
- `COMPLETADA`: Finalizada y firmada
- `CANCELADA`: Cancelada

**Componentes principales:**

- `ChecklistExecution`: Ejecución del checklist
- `MaintenanceForm`: Formulario de mantención
- `SignatureModal`: Modal de firmas
- `ExportButton`: Exportar a PDF

### 4. Programación Anual (`/planificacion`)

**Funcionalidades:**

- Vista de calendario mensual
- Programar mantenciones por fecha
- Visualizar mantenciones programadas
- Filtrar por establecimiento/equipo
- Reprogramar mantenciones

**Componentes principales:**

- `Calendar`: Calendario interactivo
- `ScheduleModal`: Modal de programación
- `DayMaintenanceList`: Lista del día

### 5. Dashboard (`/`)

**Funcionalidades:**

- Métricas en tiempo real
- Gráficos de actividad
- Mantenciones recientes
- Alertas de vencimientos
- Accesos rápidos

**KPIs mostrados:**

- Total de equipos
- Equipos operativos
- Mantenciones del mes
- Eficiencia global

### 6. Administración (`/admin`)

**Funcionalidades:**

- Gestión de usuarios y roles
- Configuración de parámetros
- Logs de auditoría en tiempo real
- Gestión de ubicaciones

**Submódulos:**

- `/admin/usuarios`: Gestión de usuarios
- `/admin/roles`: Configuración de roles
- `/admin/parametros`: Parámetros del sistema
- `/admin/logs`: Logs de auditoría

### 7. Analítica (`/analitica`)

**Funcionalidades:**

- Reportes y estadísticas
- Gráficos de tendencias
- Exportación de datos
- Análisis de cumplimiento

### 8. Búsqueda (`/buscar-folio`)

**Funcionalidades:**

- Búsqueda por número de folio
- Búsqueda general de equipos/mantenciones
- Resultados con enlaces directos

## 🗄️ Base de Datos

### Modelo de Datos Principal

El sistema utiliza Prisma ORM con SQLite (desarrollo) o PostgreSQL (producción).

**Entidades principales:**

- **User**: Usuarios del sistema con roles
- **Equipo**: Equipos e instalaciones
- **Ubicacion**: Establecimientos y áreas
- **TipoEquipo**: Tipos y categorías de equipos
- **PautaMantenimiento**: Plantillas de pautas
- **PautaItem**: Items de una pauta
- **Mantencion**: Registros de mantenciones
- **MantencionChecklistResponse**: Respuestas del checklist
- **MaintenanceSignature**: Firmas digitales
- **Notificacion**: Notificaciones del sistema
- **AuditLog**: Logs de auditoría
- **RolePermission**: Permisos por rol

### Enums

- `EstadoEquipo`: OPERATIVO, NO_OPERATIVO, DE_BAJA, FUERA_SERVICIO, DESCONOCIDO
- `TipoMantencion`: PREVENTIVO, CORRECTIVO
- `EstadoMantencion`: PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA
- `RolUsuario`: VISUALIZADOR, REGISTRADOR, ADMINISTRADOR
- `RolFirma`: TECNICO, RESPONSABLE, SUPERVISOR

### Migraciones

Las migraciones se encuentran en `prisma/migrations/`. Para crear una nueva:

```bash
npx prisma migrate dev --name nombre_descriptivo
```

## 🔐 Autenticación y Permisos

### Roles de Usuario

1. **VISUALIZADOR**: Solo lectura
2. **REGISTRADOR**: Puede crear y editar mantenciones
3. **ADMINISTRADOR**: Acceso completo + gestión de usuarios

### Sistema de Permisos

Los permisos se gestionan mediante `RolePermission` y se validan en:

- `src/lib/permissions.ts`: Funciones de validación
- `src/app/components/PermissionGuard.tsx`: Componente de protección

**Permisos disponibles:**

- `page:dashboard`
- `page:equipos`
- `page:mantenciones`
- `action:crear_mantencion`
- `action:editar_mantencion`
- `action:completar_mantencion`
- `action:gestionar_usuarios`
- etc.

## 🧪 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción

# Base de datos
npx prisma studio    # Abre Prisma Studio (GUI de BD)
npx prisma migrate   # Ejecuta migraciones
npx prisma generate  # Genera cliente de Prisma

# Linting
npm run lint         # Ejecuta ESLint
```

### Estructura de Server Actions

Las Server Actions están en `src/app/actions/`:

- `auth.ts`: Autenticación
- `equipos.ts`: CRUD de equipos
- `mantenciones.ts`: CRUD de mantenciones
- `pautas.ts`: CRUD de pautas
- `dashboard.ts`: Estadísticas del dashboard
- `permissions.ts`: Gestión de permisos
- `audit.ts`: Logs de auditoría

### Componentes Reutilizables

En `src/app/components/ui/`:

- `Button`, `Card`, `Input`, `Modal`, `Table`, `Badge`, etc.

### Estilos

- TailwindCSS para estilos utilitarios
- Modo oscuro/claro con `next-themes`
- Componentes con diseño consistente

## 🚢 Despliegue

### Preparación

1. **Configurar variables de entorno de producción**
2. **Cambiar DATABASE_URL a PostgreSQL** (si aplica)
3. **Ejecutar migraciones en producción**
4. **Build del proyecto**

```bash
npm run build
```

### Opciones de Despliegue

- **Vercel**: Recomendado para Next.js
- **Docker**: Crear Dockerfile
- **Servidor propio**: Node.js + PM2

### Migración a PostgreSQL

1. Cambiar `provider` en `prisma/schema.prisma` a `postgresql`
2. Actualizar `DATABASE_URL` en `.env`
3. Ejecutar migraciones:

```bash
npx prisma migrate deploy
```

## 📚 Referencias Normativas

El sistema cumple con:

- **INS 3.1**: Programa de Mantenimiento Preventivo Instalaciones Relevantes
- **EQ 1.2**: Sistema de Seguimiento Vida Útil de Equipamiento Crítico
- **EQ 2.1 y EQ 3.1**: Gestión de equipamiento
- **ORD 71-2023 y ORD 72-2023**: Responsables institucionales

## 📝 Notas Adicionales

- El sistema genera evidencia trazable compatible con ISO 9001:2015
- Todas las acciones se registran en `AuditLog`
- Las firmas digitales se almacenan como imágenes base64
- Los folios se generan automáticamente de forma secuencial
- El sistema soporta edición post-completada (con registro de auditoría)

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear una rama desde `main`
2. Realizar cambios
3. Crear Pull Request con descripción detallada

## 📄 Licencia

[Especificar licencia si aplica]

## 🔗 Enlaces Útiles

- [Documentación Técnica](./DOCUMENTACION_TECNICA.md)
- [Guía de Archivos](./GUIA_ARCHIVOS.md)
- [Guía para Publicar en GitHub](./GUIA_GITHUB.md)
- [Índice de Documentación](./INDICE_DOCUMENTACION.md)

## 📦 Publicar en GitHub

Para publicar este proyecto en GitHub, sigue la [Guía para Publicar en GitHub](./GUIA_GITHUB.md).

---

**Desarrollado para**: Red de salud municipal (CESFAM Dr. Alberto Reyes y dependencias)
