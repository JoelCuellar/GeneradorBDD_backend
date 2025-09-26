/*
  Warnings:

  - Added the required column `fechaActualizacion` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'ELIMINADO');

-- CreateEnum
CREATE TYPE "public"."AccionGestionUsuario" AS ENUM ('CREACION', 'INVITACION', 'ACTUALIZACION_DATOS', 'CAMBIO_ROL', 'ACTIVACION', 'SUSPENSION', 'BAJA_LOGICA');

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "eliminadoEn" TIMESTAMP(3),
ADD COLUMN     "estado" "public"."EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "fechaActualizacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "suspendidoEn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."UsuarioAuditoria" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "actorId" UUID,
    "accion" "public"."AccionGestionUsuario" NOT NULL,
    "detalle" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsuarioAuditoria_usuarioId_idx" ON "public"."UsuarioAuditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioAuditoria_actorId_idx" ON "public"."UsuarioAuditoria"("actorId");

-- AddForeignKey
ALTER TABLE "public"."UsuarioAuditoria" ADD CONSTRAINT "UsuarioAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioAuditoria" ADD CONSTRAINT "UsuarioAuditoria_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
