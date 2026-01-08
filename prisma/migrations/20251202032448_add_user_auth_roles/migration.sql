/*
  Warnings:

  - A unique constraint covering the columns `[folio]` on the table `Mantencion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Mantencion" ADD COLUMN "folio" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "rut" TEXT,
    "cargo" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'VISUALIZADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("cargo", "createdAt", "email", "id", "name", "rut", "updatedAt") SELECT "cargo", "createdAt", "email", "id", "name", "rut", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Mantencion_folio_key" ON "Mantencion"("folio");
