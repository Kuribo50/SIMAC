-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Equipo" ADD COLUMN "marca" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "cargo" TEXT;
ALTER TABLE "User" ADD COLUMN "rut" TEXT;

-- CreateTable
CREATE TABLE "PautaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "pautaId" TEXT NOT NULL,
    CONSTRAINT "PautaItem_pautaId_fkey" FOREIGN KEY ("pautaId") REFERENCES "PautaMantenimiento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MantencionChecklistResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mantencionId" TEXT NOT NULL,
    "pautaItemId" TEXT NOT NULL,
    CONSTRAINT "MantencionChecklistResponse_mantencionId_fkey" FOREIGN KEY ("mantencionId") REFERENCES "Mantencion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MantencionChecklistResponse_pautaItemId_fkey" FOREIGN KEY ("pautaItemId") REFERENCES "PautaItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceSignature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "nombreFirmante" TEXT NOT NULL,
    "rutFirmante" TEXT,
    "cargoFirmante" TEXT,
    "firmaImagen" TEXT NOT NULL,
    "firmadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "mantencionId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "MaintenanceSignature_mantencionId_fkey" FOREIGN KEY ("mantencionId") REFERENCES "Mantencion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChecklistRecord" (
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
    "mantencionId" TEXT,
    CONSTRAINT "ChecklistRecord_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChecklistRecord_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChecklistRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChecklistRecord_mantencionId_fkey" FOREIGN KEY ("mantencionId") REFERENCES "Mantencion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChecklistRecord" ("closedAt", "createdAt", "equipoId", "id", "maintenanceType", "observations", "status", "technicianName", "templateId", "updatedAt", "userId") SELECT "closedAt", "createdAt", "equipoId", "id", "maintenanceType", "observations", "status", "technicianName", "templateId", "updatedAt", "userId" FROM "ChecklistRecord";
DROP TABLE "ChecklistRecord";
ALTER TABLE "new_ChecklistRecord" RENAME TO "ChecklistRecord";
CREATE UNIQUE INDEX "ChecklistRecord_mantencionId_key" ON "ChecklistRecord"("mantencionId");
CREATE INDEX "ChecklistRecord_templateId_idx" ON "ChecklistRecord"("templateId");
CREATE INDEX "ChecklistRecord_equipoId_idx" ON "ChecklistRecord"("equipoId");
CREATE TABLE "new_Mantencion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "tipoMantencion" TEXT NOT NULL DEFAULT 'PREVENTIVO',
    "periodicidad" TEXT,
    "estadoResultante" TEXT NOT NULL,
    "estadoMantencion" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "equiposDePrueba" TEXT,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completadaEn" DATETIME,
    "equipoId" TEXT NOT NULL,
    "realizadoPorId" TEXT,
    "pautaId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "Mantencion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mantencion_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mantencion_pautaId_fkey" FOREIGN KEY ("pautaId") REFERENCES "PautaMantenimiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mantencion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mantencion_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mantencion" ("createdAt", "equipoId", "estadoMantencion", "estadoResultante", "fecha", "id", "observaciones", "pautaId", "periodicidad", "realizadoPorId", "tipoMantencion", "updatedAt") SELECT "createdAt", "equipoId", "estadoMantencion", "estadoResultante", "fecha", "id", "observaciones", "pautaId", "periodicidad", "realizadoPorId", "tipoMantencion", "updatedAt" FROM "Mantencion";
DROP TABLE "Mantencion";
ALTER TABLE "new_Mantencion" RENAME TO "Mantencion";
CREATE INDEX "Mantencion_equipoId_idx" ON "Mantencion"("equipoId");
CREATE INDEX "Mantencion_fecha_idx" ON "Mantencion"("fecha");
CREATE INDEX "Mantencion_estadoResultante_idx" ON "Mantencion"("estadoResultante");
CREATE INDEX "Mantencion_tipoMantencion_idx" ON "Mantencion"("tipoMantencion");
CREATE INDEX "Mantencion_estadoMantencion_idx" ON "Mantencion"("estadoMantencion");
CREATE TABLE "new_PautaMantenimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "periodicidadBase" TEXT NOT NULL DEFAULT 'ANUAL',
    "tipoMantencion" TEXT NOT NULL DEFAULT 'PREVENTIVO',
    "areaAdministrativa" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tipoEquipoId" TEXT,
    CONSTRAINT "PautaMantenimiento_tipoEquipoId_fkey" FOREIGN KEY ("tipoEquipoId") REFERENCES "TipoEquipo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PautaMantenimiento" ("activo", "codigo", "createdAt", "descripcion", "id", "nombre", "periodicidadBase", "updatedAt") SELECT "activo", "codigo", "createdAt", "descripcion", "id", "nombre", "periodicidadBase", "updatedAt" FROM "PautaMantenimiento";
DROP TABLE "PautaMantenimiento";
ALTER TABLE "new_PautaMantenimiento" RENAME TO "PautaMantenimiento";
CREATE UNIQUE INDEX "PautaMantenimiento_codigo_key" ON "PautaMantenimiento"("codigo");
CREATE INDEX "PautaMantenimiento_tipoEquipoId_idx" ON "PautaMantenimiento"("tipoEquipoId");
CREATE INDEX "PautaMantenimiento_tipoMantencion_idx" ON "PautaMantenimiento"("tipoMantencion");
CREATE INDEX "PautaMantenimiento_activo_idx" ON "PautaMantenimiento"("activo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PautaItem_pautaId_idx" ON "PautaItem"("pautaId");

-- CreateIndex
CREATE INDEX "PautaItem_order_idx" ON "PautaItem"("order");

-- CreateIndex
CREATE INDEX "MantencionChecklistResponse_mantencionId_idx" ON "MantencionChecklistResponse"("mantencionId");

-- CreateIndex
CREATE UNIQUE INDEX "MantencionChecklistResponse_mantencionId_pautaItemId_key" ON "MantencionChecklistResponse"("mantencionId", "pautaItemId");

-- CreateIndex
CREATE INDEX "MaintenanceSignature_mantencionId_idx" ON "MaintenanceSignature"("mantencionId");

-- CreateIndex
CREATE INDEX "MaintenanceSignature_userId_idx" ON "MaintenanceSignature"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSignature_mantencionId_role_key" ON "MaintenanceSignature"("mantencionId", "role");
