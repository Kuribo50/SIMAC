-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "modelo" TEXT,
    "marca" TEXT,
    "serie" TEXT,
    "inventario" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'OPERATIVO',
    "periodicidad" TEXT,
    "notas" TEXT,
    "imageUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ubicacionId" TEXT NOT NULL,
    "tipoEquipoId" TEXT NOT NULL,
    "pautaAsignadaId" TEXT,
    CONSTRAINT "Equipo_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Equipo_tipoEquipoId_fkey" FOREIGN KEY ("tipoEquipoId") REFERENCES "TipoEquipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Equipo_pautaAsignadaId_fkey" FOREIGN KEY ("pautaAsignadaId") REFERENCES "PautaMantenimiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipo" ("activo", "createdAt", "estado", "id", "imageUrl", "inventario", "marca", "modelo", "nombre", "notas", "periodicidad", "serie", "tipoEquipoId", "ubicacionId", "updatedAt") SELECT "activo", "createdAt", "estado", "id", "imageUrl", "inventario", "marca", "modelo", "nombre", "notas", "periodicidad", "serie", "tipoEquipoId", "ubicacionId", "updatedAt" FROM "Equipo";
DROP TABLE "Equipo";
ALTER TABLE "new_Equipo" RENAME TO "Equipo";
CREATE INDEX "Equipo_ubicacionId_idx" ON "Equipo"("ubicacionId");
CREATE INDEX "Equipo_tipoEquipoId_idx" ON "Equipo"("tipoEquipoId");
CREATE INDEX "Equipo_estado_idx" ON "Equipo"("estado");
CREATE INDEX "Equipo_pautaAsignadaId_idx" ON "Equipo"("pautaAsignadaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
