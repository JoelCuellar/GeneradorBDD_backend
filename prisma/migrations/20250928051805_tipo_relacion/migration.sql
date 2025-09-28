-- CreateEnum
CREATE TYPE "public"."TipoRelacion" AS ENUM ('ASSOCIATION', 'AGGREGATION', 'COMPOSITION', 'GENERALIZATION', 'REALIZATION', 'DEPENDENCY', 'LINK');

-- AlterTable
ALTER TABLE "public"."DominioRelacion" ADD COLUMN     "tipo" "public"."TipoRelacion" NOT NULL DEFAULT 'ASSOCIATION';
