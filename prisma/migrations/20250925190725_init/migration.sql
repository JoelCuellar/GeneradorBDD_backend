-- CreateEnum
CREATE TYPE "public"."RolProyecto" AS ENUM ('PROPIETARIO', 'EDITOR', 'LECTOR');

-- CreateEnum
CREATE TYPE "public"."EstadoHilo" AS ENUM ('ABIERTO', 'RESUELTO');

-- CreateEnum
CREATE TYPE "public"."Severidad" AS ENUM ('ERROR', 'ADVERTENCIA', 'INFO');

-- CreateEnum
CREATE TYPE "public"."EstadoHallazgo" AS ENUM ('ABIERTO', 'RESUELTO', 'IGNORADO');

-- CreateEnum
CREATE TYPE "public"."TipoSugerencia" AS ENUM ('ATRIBUTO', 'RELACION', 'CARDINALIDAD');

-- CreateEnum
CREATE TYPE "public"."EstadoSugerencia" AS ENUM ('PROPUESTO', 'APLICADO', 'DESCARTADO', 'REVERTIDO');

-- CreateEnum
CREATE TYPE "public"."EstadoGeneracion" AS ENUM ('PENDIENTE', 'EJECUTANDO', 'COMPLETADO', 'FALLADO');

-- CreateEnum
CREATE TYPE "public"."TipoArtefacto" AS ENUM ('ZIP', 'OPENAPI', 'MIGRACIONES');

-- CreateEnum
CREATE TYPE "public"."EstadoPrueba" AS ENUM ('APROBADO', 'FALLADO', 'PARCIAL');

-- CreateEnum
CREATE TYPE "public"."TipoCambio" AS ENUM ('ADD', 'UPDATE', 'REMOVE');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proyecto" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivado" BOOLEAN NOT NULL DEFAULT false,
    "propietarioId" UUID NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProyectoUsuario" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "rol" "public"."RolProyecto" NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProyectoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModeloJson" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "contenido" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "esActual" BOOLEAN NOT NULL DEFAULT false,
    "nota" VARCHAR(500),
    "creadorMembresiaId" UUID,

    CONSTRAINT "ModeloJson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComentarioHilo" (
    "id" UUID NOT NULL,
    "elementRef" VARCHAR(200) NOT NULL,
    "estado" "public"."EstadoHilo" NOT NULL DEFAULT 'ABIERTO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membresiaId" UUID,

    CONSTRAINT "ComentarioHilo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comentario" (
    "id" UUID NOT NULL,
    "hiloId" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorMembresiaId" UUID,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ValidacionRegla" (
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "severidad" "public"."Severidad" NOT NULL,

    CONSTRAINT "ValidacionRegla_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."ValidacionHallazgo" (
    "id" UUID NOT NULL,
    "modeloVersionId" UUID NOT NULL,
    "ruleCode" VARCHAR(50) NOT NULL,
    "severidad" "public"."Severidad" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "elementRef" VARCHAR(200) NOT NULL,
    "estado" "public"."EstadoHallazgo" NOT NULL DEFAULT 'ABIERTO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoPorMembresiaId" UUID,

    CONSTRAINT "ValidacionHallazgo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IASugerencia" (
    "id" UUID NOT NULL,
    "modeloVersionId" UUID NOT NULL,
    "tipo" "public"."TipoSugerencia" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "public"."EstadoSugerencia" NOT NULL DEFAULT 'PROPUESTO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorMembresiaId" UUID,
    "diffId" UUID,

    CONSTRAINT "IASugerencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Diff" (
    "id" UUID NOT NULL,
    "resumen" VARCHAR(300) NOT NULL,

    CONSTRAINT "Diff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiffEntrada" (
    "id" UUID NOT NULL,
    "diffId" UUID NOT NULL,
    "path" VARCHAR(300) NOT NULL,
    "cambio" "public"."TipoCambio" NOT NULL,
    "antes" JSONB,
    "despues" JSONB,

    CONSTRAINT "DiffEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeneracionJob" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "estado" "public"."EstadoGeneracion" NOT NULL DEFAULT 'PENDIENTE',
    "opciones" JSONB,
    "inicio" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "log" TEXT,

    CONSTRAINT "GeneracionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Artefacto" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "tipo" "public"."TipoArtefacto" NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,

    CONSTRAINT "Artefacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PruebaEjecucion" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "baseURL" VARCHAR(255) NOT NULL,
    "estado" "public"."EstadoPrueba" NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PruebaEjecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PruebaCasoResultado" (
    "id" UUID NOT NULL,
    "ejecucionId" UUID NOT NULL,
    "endpoint" VARCHAR(300) NOT NULL,
    "metodo" VARCHAR(10) NOT NULL,
    "statusEsperado" INTEGER NOT NULL,
    "statusObtenido" INTEGER NOT NULL,
    "duracionMs" INTEGER NOT NULL,
    "paso" BOOLEAN NOT NULL,

    CONSTRAINT "PruebaCasoResultado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DatoSemilla" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "payloadJSON" JSONB NOT NULL,

    CONSTRAINT "DatoSemilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProyectoUsuario_proyectoId_usuarioId_key" ON "public"."ProyectoUsuario"("proyectoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ProyectoUsuario_id_proyectoId_key" ON "public"."ProyectoUsuario"("id", "proyectoId");

-- CreateIndex
CREATE INDEX "ModeloJson_proyectoId_esActual_idx" ON "public"."ModeloJson"("proyectoId", "esActual");

-- CreateIndex
CREATE UNIQUE INDEX "ModeloJson_proyectoId_version_key" ON "public"."ModeloJson"("proyectoId", "version");

-- AddForeignKey
ALTER TABLE "public"."Proyecto" ADD CONSTRAINT "Proyecto_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProyectoUsuario" ADD CONSTRAINT "ProyectoUsuario_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProyectoUsuario" ADD CONSTRAINT "ProyectoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModeloJson" ADD CONSTRAINT "ModeloJson_creadorMembresiaId_proyectoId_fkey" FOREIGN KEY ("creadorMembresiaId", "proyectoId") REFERENCES "public"."ProyectoUsuario"("id", "proyectoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModeloJson" ADD CONSTRAINT "ModeloJson_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComentarioHilo" ADD CONSTRAINT "ComentarioHilo_membresiaId_fkey" FOREIGN KEY ("membresiaId") REFERENCES "public"."ProyectoUsuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_autorMembresiaId_fkey" FOREIGN KEY ("autorMembresiaId") REFERENCES "public"."ProyectoUsuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_hiloId_fkey" FOREIGN KEY ("hiloId") REFERENCES "public"."ComentarioHilo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ValidacionHallazgo" ADD CONSTRAINT "ValidacionHallazgo_resueltoPorMembresiaId_fkey" FOREIGN KEY ("resueltoPorMembresiaId") REFERENCES "public"."ProyectoUsuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ValidacionHallazgo" ADD CONSTRAINT "ValidacionHallazgo_modeloVersionId_fkey" FOREIGN KEY ("modeloVersionId") REFERENCES "public"."ModeloJson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ValidacionHallazgo" ADD CONSTRAINT "ValidacionHallazgo_ruleCode_fkey" FOREIGN KEY ("ruleCode") REFERENCES "public"."ValidacionRegla"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IASugerencia" ADD CONSTRAINT "IASugerencia_creadorMembresiaId_fkey" FOREIGN KEY ("creadorMembresiaId") REFERENCES "public"."ProyectoUsuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IASugerencia" ADD CONSTRAINT "IASugerencia_diffId_fkey" FOREIGN KEY ("diffId") REFERENCES "public"."Diff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IASugerencia" ADD CONSTRAINT "IASugerencia_modeloVersionId_fkey" FOREIGN KEY ("modeloVersionId") REFERENCES "public"."ModeloJson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiffEntrada" ADD CONSTRAINT "DiffEntrada_diffId_fkey" FOREIGN KEY ("diffId") REFERENCES "public"."Diff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeneracionJob" ADD CONSTRAINT "GeneracionJob_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Artefacto" ADD CONSTRAINT "Artefacto_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."GeneracionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PruebaEjecucion" ADD CONSTRAINT "PruebaEjecucion_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PruebaCasoResultado" ADD CONSTRAINT "PruebaCasoResultado_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "public"."PruebaEjecucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DatoSemilla" ADD CONSTRAINT "DatoSemilla_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
