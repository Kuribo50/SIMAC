# Contexto del Proyecto: Sistema de Gestión de Mantenciones

## 1. Contexto del proyecto

**Entorno:** Red de salud municipal (CESFAM Dr. Alberto Reyes y dependencias: CECOSF, SAR, etc.).

**Necesidad:** Reemplazar planillas y pautas en papel de mantención preventiva por un sistema web único.

**Uso principal:** Llevar el control de mantenciones preventivas y correctivas de:

- **Instalaciones relevantes:** Calderas, techumbre, sistemas de climatización, grupo electrógeno, gases clínicos, manifold de oxígeno, señaléticas, etc.
- **Equipos críticos:** Definidos en los documentos de equipamiento crítico y sus fichas/hojas de vida.

El sistema debe generar evidencia trazable y compatible con un sistema de gestión de calidad tipo ISO 9001:2015 (control documental, registros, auditoría).

## 2. Lineamientos y referencias normativas

Todo el diseño debe respetar estos documentos internos (ya disponibles en PDF):

- **INS 3.1 – Programa de Mantenimiento Preventivo Instalaciones Relevantes**
  - Define qué instalaciones son “relevantes”.
  - Establece obligación de un programa anual (carta Gantt por trimestre).
  - Incluye anexos con pautas (checklist) por tipo de instalación.
- **EQ 1.2 – Sistema de Seguimiento Vida Útil de Equipamiento Crítico**
  - Define equipos críticos.
  - Exige hoja de vida por equipo crítico y controles asociados.
- **EQ 2.1 y EQ 3.1**
  - Complementan la gestión de equipamiento, fichas técnicas, procedimientos de mantención y criterios de criticidad.
- **ORD 71-2023 y ORD 72-2023**
  - Designan responsables institucionales de mantención (por ejemplo jefaturas administrativas, referentes de calidad).
  - Exigen evidencia formal del cumplimiento de mantenciones preventivas y de las señaléticas.

> **Nota:** La IA que continúe el proyecto debe considerar que los formatos de los anexos (pautas en tabla, carta Gantt, hoja de vida) son la referencia visual para los PDFs y pantallas.

## 3. Stack tecnológico deseado

- **Frontend y backend:** Next.js 14+ (App Router).
- **Lenguaje:** TypeScript.
- **Estilos:** TailwindCSS.
- **ORM:** Prisma.
- **Base de datos:**
  - Desarrollo: SQLite (simple y portable).
  - Producción: PostgreSQL (migración posterior).
- **Autenticación:** Se usará más adelante (por ejemplo NextAuth), pero el diseño debe considerar roles.

## 4. Módulos funcionales del sistema

La idea es un sistema completo, pero el primer módulo a implementar será el de checklist de mantención.

### 4.1. Módulo 1 – Catastro de equipos e instalaciones

**Objetivo:** Tener un catálogo único de todo lo que se mantiene.

**Características:**

- Registrar “equipos” e “instalaciones”, con campos tales como:
  - Nombre.
  - Tipo (caldera, techumbre, climatización, grupo electrógeno, gases clínicos, señalética, etc.).
  - Centro/establecimiento (CESFAM, CECOSF X…).
  - Ubicación física.
  - Marca, modelo, número de serie, número de inventario.
  - Estado (activo / en reparación / dado de baja).
- Para equipos críticos: vida útil estimada, fecha de alta, etc. (alineado con EQ 1.2).

Este módulo se usará como base para asociar mantenciones a cada equipo/instalación.

### 4.2. Módulo 2 – Plantillas de checklist de mantención (PAUTAS)

**Objetivo:** Poder parametrizar las pautas de mantención (checklists) que hoy están en papel en INS 3.1 e instrucciones similares.

**Requisitos:**

- Crear plantillas de pauta de mantención con:
  - Nombre de la pauta (ej: “Caldera calefacción CESFAM”, “Techumbre CESFAM”, “Grupo electrógeno”, “Señalética externa”).
  - Tipo de instalación o equipo al que se aplica.
  - Código o referencia normativa (por ejemplo: “INS 3.1 Anexo 2 – Caldera”).
  - Versión de la pauta.
  - Estado (activa / inactiva).
- Cada plantilla tiene una lista ordenada de ítems:
  - Número de ítem.
  - Descripción (ej: “Inspección interna y externa”, “Revisión sistema de gases de combustión”, “Revisión fijaciones techumbre”, etc.).
  - Indicador de si el ítem es obligatorio o no.
- El sistema debe permitir:
  - Crear nuevas pautas.
  - Editar ítems de una pauta.
  - Desactivar pautas viejas cuando cambie el procedimiento (control de versiones).

### 4.3. Módulo 3 – Ejecución de mantenciones (registro de checklist)

**Objetivo:** Registrar cada mantención concreta hecha en terreno usando una pauta.

**Requisitos:**

- **Flujo para iniciar mantención:**
  - Seleccionar equipo/instalación.
  - Seleccionar plantilla de pauta asociada a ese tipo.
  - Indicar:
    - Fecha de mantención.
    - Tipo de mantención: preventiva / correctiva.
    - Nombre del técnico que realiza la mantención.
- **El sistema crea un “registro de checklist” que:**
  - Copia los ítems de la plantilla.
  - Inicializa cada ítem como “no completado”.
  - Permite ir marcando los ítems según se van realizando.
- **Durante la ejecución se debe poder:**
  - Marcar cada ítem como completado o no completado.
  - Agregar comentarios por ítem (opcional).
  - Agregar observaciones generales al final.
  - Guardar borrador y continuar después.
  - Cerrar la mantención, dejándola como “completada” y no editable.
- **Al cierre:**
  - Registrar nombre de quien recibe o valida (responsable institucional definido en ORD 71/72).
  - Registrar fecha de cierre.
  - Mantener un estado del registro (en proceso, completado, anulado).

### 4.4. Módulo 4 – Programa anual de mantención (Carta Gantt)

**Objetivo:** Cumplir con la exigencia de INS 3.1 de tener un programa anual de mantenciones por trimestre.

**Requisitos:**

- Definir por año y centro:
  - Qué equipos/instalaciones deben ser mantenidos.
  - En qué trimestre (o mes) se programan sus mantenciones preventivas.
- Visualizar en formato tipo Gantt simple:
  - Filas = equipos/instalaciones.
  - Columnas = trimestre o meses.
- Permitir:
  - Marcar mantenciones como “programadas”, “ejecutadas”, “vencidas”, “reprogramadas”.
  - Registrar motivo de reprogramación cuando se mueva de fecha.

### 4.5. Módulo 5 – Hoja de vida de equipos críticos

**Basado en EQ 1.2.**

**Requisitos:**

- Para equipos marcados como “críticos”:
  - Mostrar ficha única del equipo (datos, vida útil, ubicación).
  - Listar todas las mantenciones asociadas.
  - Mostrar campos como:
    - Fecha de adquisición.
    - Vida útil estimada.
    - Historial de fallas relevantes.
  - Calcular en base al tiempo transcurrido y cantidad/tipo de mantenciones si se aproxima el fin de vida útil, como apoyo a decisión de recambio.

### 4.6. Módulo 6 – Dashboard y reportes

**Requisitos:**

- **Vista de resumen:**
  - % de mantenciones preventivas cumplidas por año y trimestre.
  - Número de mantenciones vencidas y reprogramadas.
  - Equipos con más mantenciones correctivas (posibles problemas).
- **Reportes descargables (CSV/PDF):**
  - Listado de mantenciones realizadas en un periodo.
  - Listado de equipos e instalaciones con su estado de mantención.
  - Reportes específicos para inspecciones de calidad.

### 4.7. Módulo 7 – Usuarios y roles (futuro inmediato)

**Roles esperados, alineados con ORD 71/72:**

- Administrador del sistema (TI / mantención central).
- Responsable institucional de mantención por establecimiento.
- Técnicos de mantención (internos o externos).
- Usuarios solo lectura (coordinadores, calidad).

**Permisos a considerar:**

- Creación/edición de pautas.
- Registro de mantenciones.
- Aprobación/cierre de mantenciones.
- Configuración del programa anual.

## 5. Diseño conceptual de datos (Entidades principales)

- **Centro / Establecimiento:** Nombre, dirección, tipo (CESFAM, CECOSF, SAR).
- **Equipo / Instalación:** Identificación general, tipo, centro, ubicación física, estado, datos técnicos básicos. Campo booleano “crítico”.
- **Plantilla de Pauta de Mantención:** Nombre, tipo de equipo/instalación, versión, código norma, estado.
- **Ítem de Pauta:** Orden, descripción, obligatorio. (Relación con Plantilla).
- **Registro de Checklist (mantención ejecutada):** Referencia a plantilla, equipo, fecha, tipo (preventiva/correctiva), técnico, responsable, observaciones, estado.
- **Respuesta por ítem de checklist:** Relación con registro y con ítem de plantilla, campo “completado”, comentario.
- **Programa de mantención (línea de Gantt):** Año, equipo/instalación, trimestre/mes, estado (programado, ejecutado, vencido, reprogramado), motivo de reprogramación.
- **Hoja de vida:** Derivada de equipo + mantenciones, o tabla propia con campos agregados.
- **Usuario y rol:** (Futuro).

## 6. Prioridad de implementación

1.  **Configurar proyecto base:** Next.js + Prisma + SQLite (Prisma estable < 7 recomendado).
2.  **Implementar Módulo 2 (pautas) y Módulo 3 (checklists ejecutados):**
    - CRUD de plantillas de pauta.
    - Crear registro de checklist a partir de una plantilla.
    - Pantalla para marcar ítems como completados.
    - Agregar asociación con equipos/instalaciones (Módulo 1).
    - Agregar listado/historial de mantenciones por equipo.
    - Implementar generación de PDF con layout similar a los anexos de INS 3.1 y EQ 1.2.
3.  **Construir progresivamente:**
    - Programa anual (Gantt).
    - Hoja de vida.
    - Dashboard.
    - Usuarios/roles.
