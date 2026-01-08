-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maintenanceType" TEXT NOT NULL DEFAULT 'preventiva',
    "technicianName" TEXT,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'en_proceso',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "equipoId" TEXT,
    "templateId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "ChecklistRecord_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChecklistRecord_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChecklistRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "recordId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    CONSTRAINT "ChecklistResponse_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "ChecklistRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChecklistResponse_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ChecklistItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establecimiento" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TipoEquipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "modelo" TEXT,
    "serie" TEXT,
    "inventario" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'OPERATIVO',
    "periodicidad" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ubicacionId" TEXT NOT NULL,
    "tipoEquipoId" TEXT NOT NULL,
    CONSTRAINT "Equipo_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Equipo_tipoEquipoId_fkey" FOREIGN KEY ("tipoEquipoId") REFERENCES "TipoEquipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PautaMantenimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "periodicidadBase" TEXT NOT NULL DEFAULT 'ANUAL',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mantencion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "tipoMantencion" TEXT NOT NULL DEFAULT 'PREVENTIVO',
    "periodicidad" TEXT,
    "estadoResultante" TEXT NOT NULL,
    "estadoMantencion" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "equipoId" TEXT NOT NULL,
    "realizadoPorId" TEXT,
    "pautaId" TEXT,
    CONSTRAINT "Mantencion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mantencion_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mantencion_pautaId_fkey" FOREIGN KEY ("pautaId") REFERENCES "PautaMantenimiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ChecklistItem_templateId_idx" ON "ChecklistItem"("templateId");

-- CreateIndex
CREATE INDEX "ChecklistRecord_templateId_idx" ON "ChecklistRecord"("templateId");

-- CreateIndex
CREATE INDEX "ChecklistRecord_equipoId_idx" ON "ChecklistRecord"("equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistResponse_recordId_itemId_key" ON "ChecklistResponse"("recordId", "itemId");

-- CreateIndex
CREATE INDEX "Ubicacion_establecimiento_idx" ON "Ubicacion"("establecimiento");

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_establecimiento_area_key" ON "Ubicacion"("establecimiento", "area");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEquipo_codigo_key" ON "TipoEquipo"("codigo");

-- CreateIndex
CREATE INDEX "TipoEquipo_categoria_idx" ON "TipoEquipo"("categoria");

-- CreateIndex
CREATE INDEX "TipoEquipo_subcategoria_idx" ON "TipoEquipo"("subcategoria");

-- CreateIndex
CREATE INDEX "Equipo_ubicacionId_idx" ON "Equipo"("ubicacionId");

-- CreateIndex
CREATE INDEX "Equipo_tipoEquipoId_idx" ON "Equipo"("tipoEquipoId");

-- CreateIndex
CREATE INDEX "Equipo_estado_idx" ON "Equipo"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "PautaMantenimiento_codigo_key" ON "PautaMantenimiento"("codigo");

-- CreateIndex
CREATE INDEX "Mantencion_equipoId_idx" ON "Mantencion"("equipoId");

-- CreateIndex
CREATE INDEX "Mantencion_fecha_idx" ON "Mantencion"("fecha");

-- CreateIndex
CREATE INDEX "Mantencion_estadoResultante_idx" ON "Mantencion"("estadoResultante");

-- CreateIndex
CREATE INDEX "Mantencion_tipoMantencion_idx" ON "Mantencion"("tipoMantencion");
