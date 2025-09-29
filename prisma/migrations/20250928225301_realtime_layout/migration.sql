-- CreateTable
CREATE TABLE "public"."DiagramNodeLayout" (
    "projectId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagramNodeLayout_pkey" PRIMARY KEY ("projectId","classId")
);

-- CreateTable
CREATE TABLE "public"."DiagramEdgeAnchor" (
    "projectId" UUID NOT NULL,
    "relationId" UUID NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagramEdgeAnchor_pkey" PRIMARY KEY ("projectId","relationId")
);

-- CreateIndex
CREATE INDEX "DiagramNodeLayout_projectId_idx" ON "public"."DiagramNodeLayout"("projectId");

-- CreateIndex
CREATE INDEX "DiagramEdgeAnchor_projectId_idx" ON "public"."DiagramEdgeAnchor"("projectId");
