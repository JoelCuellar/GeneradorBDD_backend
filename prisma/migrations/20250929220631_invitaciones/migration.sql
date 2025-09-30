-- CreateEnum
CREATE TYPE "public"."EstadoInvitacion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "public"."ProyectoInvitacion" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "rol" "public"."RolProyecto" NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "estado" "public"."EstadoInvitacion" NOT NULL DEFAULT 'PENDIENTE',
    "creadoPorId" UUID NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" TIMESTAMP(3),
    "aceptadoPorId" UUID,
    "aceptadoEn" TIMESTAMP(3),

    CONSTRAINT "ProyectoInvitacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProyectoInvitacion_token_key" ON "public"."ProyectoInvitacion"("token");

-- CreateIndex
CREATE INDEX "ProyectoInvitacion_proyectoId_idx" ON "public"."ProyectoInvitacion"("proyectoId");

-- CreateIndex
CREATE INDEX "ProyectoInvitacion_email_idx" ON "public"."ProyectoInvitacion"("email");

-- AddForeignKey
ALTER TABLE "public"."ProyectoInvitacion" ADD CONSTRAINT "ProyectoInvitacion_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProyectoInvitacion" ADD CONSTRAINT "ProyectoInvitacion_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProyectoInvitacion" ADD CONSTRAINT "ProyectoInvitacion_aceptadoPorId_fkey" FOREIGN KEY ("aceptadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
