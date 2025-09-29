import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

// Lee posiciones de nodos y anclajes de aristas
@Controller('projects/:projectId/layout')
export class DiagramController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /projects/:projectId/layout
  @Get()
  async getLayout(@Param('projectId') projectId: string) {
    // Si no creaste las tablas opcionales, devuelve arrays vacíos
    try {
      const [nodes, edges] = await Promise.all([
        this.prisma.diagramNodeLayout.findMany({ where: { projectId } }),
        this.prisma.diagramEdgeAnchor.findMany({ where: { projectId } }),
      ]);

      return {
        nodes: nodes.map(n => ({ classId: n.classId, x: n.x, y: n.y, updatedAt: n.updatedAt })),
        edges: edges.map(e => ({
          relationId: e.relationId,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          updatedAt: e.updatedAt,
        })),
      };
    } catch {
      // Si aún no hiciste la migración del layout, no rompas:
      return { nodes: [], edges: [] };
    }
  }

  // (opcionales si te sirven)
  // GET /projects/:projectId/layout/nodes
  @Get('nodes')
  async getNodes(@Param('projectId') projectId: string) {
    try {
      const nodes = await this.prisma.diagramNodeLayout.findMany({ where: { projectId } });
      return nodes;
    } catch {
      return [];
    }
  }

  // GET /projects/:projectId/layout/edges
  @Get('edges')
  async getEdges(@Param('projectId') projectId: string) {
    try {
      const edges = await this.prisma.diagramEdgeAnchor.findMany({ where: { projectId } });
      return edges;
    } catch {
      return [];
    }
  }
}
