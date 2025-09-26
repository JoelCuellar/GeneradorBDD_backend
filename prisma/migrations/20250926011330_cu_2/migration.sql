/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Proyecto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fechaActualizacion` to the `Proyecto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AccionGestionProyecto" AS ENUM ('CREACION', 'ACTUALIZACION', 'ARCHIVADO');

-- AlterTable
ALTER TABLE "public"."Proyecto" ADD COLUMN     "archivadoEn" TIMESTAMP(3),
ADD COLUMN     "fechaActualizacion" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."ProyectoAuditoria" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "actorId" UUID,
    "accion" "public"."AccionGestionProyecto" NOT NULL,
    "detalle" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProyectoAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProyectoAuditoria_proyectoId_idx" ON "public"."ProyectoAuditoria"("proyectoId");

-- CreateIndex
CREATE INDEX "ProyectoAuditoria_actorId_idx" ON "public"."ProyectoAuditoria"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_nombre_key" ON "public"."Proyecto"("nombre");

-- CreateIndex
CREATE INDEX "Proyecto_propietarioId_idx" ON "public"."Proyecto"("propietarioId");

-- AddForeignKey
ALTER TABLE "public"."ProyectoAuditoria" ADD CONSTRAINT "ProyectoAuditoria_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProyectoAuditoria" ADD CONSTRAINT "ProyectoAuditoria_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
