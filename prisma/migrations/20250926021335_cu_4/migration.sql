-- CreateEnum
CREATE TYPE "public"."TipoAtributoDominio" AS ENUM ('STRING', 'ENTERO', 'DECIMAL', 'BOOLEANO', 'FECHA', 'FECHA_HORA', 'UUID', 'TEXTO');

-- CreateEnum
CREATE TYPE "public"."MultiplicidadRelacion" AS ENUM ('UNO', 'CERO_O_UNO', 'UNO_O_MAS', 'CERO_O_MAS');

-- CreateEnum
CREATE TYPE "public"."AccionModeloDominio" AS ENUM ('CLASE_CREADA', 'CLASE_ACTUALIZADA', 'CLASE_ELIMINADA', 'ATRIBUTO_CREADO', 'ATRIBUTO_ACTUALIZADO', 'ATRIBUTO_ELIMINADO', 'RELACION_CREADA', 'RELACION_ACTUALIZADA', 'RELACION_ELIMINADA', 'IDENTIDAD_DEFINIDA', 'IDENTIDAD_ELIMINADA');

-- CreateTable
CREATE TABLE "public"."DominioClase" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" VARCHAR(500),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DominioClase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DominioAtributo" (
    "id" UUID NOT NULL,
    "claseId" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo" "public"."TipoAtributoDominio" NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,
    "configuracion" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DominioAtributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DominioRelacion" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "origenId" UUID NOT NULL,
    "destinoId" UUID NOT NULL,
    "nombre" VARCHAR(150),
    "rolOrigen" VARCHAR(150),
    "rolDestino" VARCHAR(150),
    "multiplicidadOrigen" "public"."MultiplicidadRelacion" NOT NULL,
    "multiplicidadDestino" "public"."MultiplicidadRelacion" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DominioRelacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DominioIdentidad" (
    "id" UUID NOT NULL,
    "claseId" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" VARCHAR(500),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DominioIdentidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DominioIdentidadAtributo" (
    "identidadId" UUID NOT NULL,
    "atributoId" UUID NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DominioIdentidadAtributo_pkey" PRIMARY KEY ("identidadId","atributoId")
);

-- CreateTable
CREATE TABLE "public"."DominioAuditoria" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "accion" "public"."AccionModeloDominio" NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "entidadId" UUID NOT NULL,
    "detalle" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DominioAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DominioClase_proyectoId_idx" ON "public"."DominioClase"("proyectoId");

-- CreateIndex
CREATE UNIQUE INDEX "DominioClase_proyectoId_nombre_key" ON "public"."DominioClase"("proyectoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "DominioAtributo_claseId_nombre_key" ON "public"."DominioAtributo"("claseId", "nombre");

-- CreateIndex
CREATE INDEX "DominioRelacion_proyectoId_idx" ON "public"."DominioRelacion"("proyectoId");

-- CreateIndex
CREATE INDEX "DominioRelacion_origenId_idx" ON "public"."DominioRelacion"("origenId");

-- CreateIndex
CREATE INDEX "DominioRelacion_destinoId_idx" ON "public"."DominioRelacion"("destinoId");

-- CreateIndex
CREATE UNIQUE INDEX "DominioIdentidad_claseId_nombre_key" ON "public"."DominioIdentidad"("claseId", "nombre");

-- CreateIndex
CREATE INDEX "DominioAuditoria_proyectoId_idx" ON "public"."DominioAuditoria"("proyectoId");

-- CreateIndex
CREATE INDEX "DominioAuditoria_actorId_idx" ON "public"."DominioAuditoria"("actorId");

-- AddForeignKey
ALTER TABLE "public"."DominioClase" ADD CONSTRAINT "DominioClase_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioAtributo" ADD CONSTRAINT "DominioAtributo_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "public"."DominioClase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioRelacion" ADD CONSTRAINT "DominioRelacion_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioRelacion" ADD CONSTRAINT "DominioRelacion_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "public"."DominioClase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioRelacion" ADD CONSTRAINT "DominioRelacion_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "public"."DominioClase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioIdentidad" ADD CONSTRAINT "DominioIdentidad_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "public"."DominioClase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioIdentidadAtributo" ADD CONSTRAINT "DominioIdentidadAtributo_identidadId_fkey" FOREIGN KEY ("identidadId") REFERENCES "public"."DominioIdentidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioIdentidadAtributo" ADD CONSTRAINT "DominioIdentidadAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "public"."DominioAtributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioAuditoria" ADD CONSTRAINT "DominioAuditoria_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioAuditoria" ADD CONSTRAINT "DominioAuditoria_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
