-- CreateEnum
CREATE TYPE "public"."CategoriaValidacionDominio" AS ENUM ('SINTAXIS', 'INTEGRIDAD', 'NORMALIZACION', 'ANTIPATRONES');

-- CreateTable
CREATE TABLE "public"."DominioValidacionRegla" (
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "categoria" "public"."CategoriaValidacionDominio" NOT NULL,
    "severidad" "public"."Severidad" NOT NULL,
    "sugerencia" VARCHAR(500),

    CONSTRAINT "DominioValidacionRegla_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."DominioValidacionHallazgo" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "reglaCodigo" VARCHAR(50) NOT NULL,
    "elementoTipo" VARCHAR(50) NOT NULL,
    "elementoPath" VARCHAR(200) NOT NULL,
    "elementoId" UUID,
    "elementoNombre" VARCHAR(150),
    "severidad" "public"."Severidad" NOT NULL,
    "categoria" "public"."CategoriaValidacionDominio" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "sugerencia" VARCHAR(500),
    "estado" "public"."EstadoHallazgo" NOT NULL DEFAULT 'ABIERTO',
    "actorUltimaActualizacionId" UUID,
    "justificacion" VARCHAR(500),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DominioValidacionHallazgo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DominioValidacionHallazgo_proyectoId_reglaCodigo_idx" ON "public"."DominioValidacionHallazgo"("proyectoId", "reglaCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "DominioValidacionHallazgo_proyectoId_reglaCodigo_elementoPa_key" ON "public"."DominioValidacionHallazgo"("proyectoId", "reglaCodigo", "elementoPath");

-- AddForeignKey
ALTER TABLE "public"."DominioValidacionHallazgo" ADD CONSTRAINT "DominioValidacionHallazgo_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioValidacionHallazgo" ADD CONSTRAINT "DominioValidacionHallazgo_reglaCodigo_fkey" FOREIGN KEY ("reglaCodigo") REFERENCES "public"."DominioValidacionRegla"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DominioValidacionHallazgo" ADD CONSTRAINT "DominioValidacionHallazgo_actorUltimaActualizacionId_fkey" FOREIGN KEY ("actorUltimaActualizacionId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
