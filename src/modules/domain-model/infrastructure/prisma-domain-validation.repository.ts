import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CategoriaValidacionDominio,
  EstadoHallazgo,
  Prisma,
  Severidad,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  DOMAIN_VALIDATION_REPOSITORY,
  DomainValidationRepository,
  DomainValidationRuleDefinition,
  PersistedDomainValidationFinding,
  severityOrder,
  stateOrder,
  categoryOrder,
} from '../domain/domain-validation.repository';
import {
  DomainValidationCategory,
  DomainValidationFinding,
  DomainValidationFindingRecord,
} from '../domain/domain-validation.entity';

const mapSeverity = (value: Severidad) =>
  value as unknown as 'ERROR' | 'ADVERTENCIA' | 'INFO';
const mapCategory = (
  value: CategoriaValidacionDominio,
): DomainValidationCategory => value as unknown as DomainValidationCategory;
const mapState = (value: EstadoHallazgo): 'ABIERTO' | 'RESUELTO' | 'IGNORADO' =>
  value as unknown as 'ABIERTO' | 'RESUELTO' | 'IGNORADO';

@Injectable()
export class PrismaDomainValidationRepository
  implements DomainValidationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listFindings(
    projectId: string,
  ): Promise<PersistedDomainValidationFinding[]> {
    const rows = await this.prisma.dominioValidacionHallazgo.findMany({
      where: { proyectoId: projectId },
      include: { regla: true },
    });
    return this.mapRows(rows).sort(this.sortFindings);
  }

  async syncFindings({
    projectId,
    actorId,
    rules,
    findings,
  }: {
    projectId: string;
    actorId: string;
    rules: DomainValidationRuleDefinition[];
    findings: DomainValidationFinding[];
  }): Promise<PersistedDomainValidationFinding[]> {
    await this.prisma.$transaction(async (tx) => {
      for (const rule of rules) {
        await tx.dominioValidacionRegla.upsert({
          where: { codigo: rule.code },
          update: {
            nombre: rule.name,
            descripcion: rule.description,
            categoria: rule.category as CategoriaValidacionDominio,
            severidad: rule.severity as Severidad,
            sugerencia: rule.suggestion ?? null,
          },
          create: {
            codigo: rule.code,
            nombre: rule.name,
            descripcion: rule.description,
            categoria: rule.category as CategoriaValidacionDominio,
            severidad: rule.severity as Severidad,
            sugerencia: rule.suggestion ?? null,
          },
        });
      }

      const existing = await tx.dominioValidacionHallazgo.findMany({
        where: { proyectoId: projectId },
      });

      const existingMap = new Map<string, typeof existing[number]>();
      for (const item of existing) {
        const key = this.buildKey(item.reglaCodigo, item.elementoPath);
        existingMap.set(key, item);
      }

      for (const finding of findings) {
        const key = this.buildKey(finding.ruleCode, finding.elementPath);
        const current = existingMap.get(key);
        existingMap.delete(key);

        if (current) {
          const estadoActual = current.estado as EstadoHallazgo;
          const isIgnored = estadoActual === EstadoHallazgo.IGNORADO;
          await tx.dominioValidacionHallazgo.update({
            where: { id: current.id },
            data: {
              reglaCodigo: finding.ruleCode,
              elementoTipo: finding.elementType,
              elementoPath: finding.elementPath,
              elementoId: finding.elementId ?? null,
              elementoNombre: finding.elementName ?? null,
              severidad: finding.severity as Severidad,
              categoria: finding.category as CategoriaValidacionDominio,
              descripcion: finding.message,
              sugerencia: finding.suggestion ?? null,
              estado: isIgnored ? EstadoHallazgo.IGNORADO : EstadoHallazgo.ABIERTO,
              justificacion: isIgnored ? current.justificacion : null,
              actorUltimaActualizacionId: isIgnored
                ? current.actorUltimaActualizacionId
                : actorId,
            },
          });
        } else {
          await tx.dominioValidacionHallazgo.create({
            data: {
              proyectoId: projectId,
              reglaCodigo: finding.ruleCode,
              elementoTipo: finding.elementType,
              elementoPath: finding.elementPath,
              elementoId: finding.elementId ?? null,
              elementoNombre: finding.elementName ?? null,
              severidad: finding.severity as Severidad,
              categoria: finding.category as CategoriaValidacionDominio,
              descripcion: finding.message,
              sugerencia: finding.suggestion ?? null,
              estado: EstadoHallazgo.ABIERTO,
              actorUltimaActualizacionId: actorId,
            },
          });
        }
      }

      for (const leftover of existingMap.values()) {
        if (leftover.estado !== EstadoHallazgo.RESUELTO) {
          await tx.dominioValidacionHallazgo.update({
            where: { id: leftover.id },
            data: {
              estado: EstadoHallazgo.RESUELTO,
              actorUltimaActualizacionId: actorId,
              justificacion: leftover.justificacion,
            },
          });
        }
      }
    });

    return this.listFindings(projectId);
  }

  async ignoreFinding({
    projectId,
    findingId,
    actorId,
    justification,
  }: {
    projectId: string;
    findingId: string;
    actorId: string;
    justification: string;
  }): Promise<PersistedDomainValidationFinding> {
    await this.assertFindingBelongs(projectId, findingId);
    const updated = await this.prisma.dominioValidacionHallazgo.update({
      where: { id: findingId },
      data: {
        estado: EstadoHallazgo.IGNORADO,
        justificacion: justification,
        actorUltimaActualizacionId: actorId,
      },
      include: { regla: true },
    });
    return this.mapRows([updated])[0];
  }

  async reopenFinding({
    projectId,
    findingId,
    actorId,
  }: {
    projectId: string;
    findingId: string;
    actorId: string;
  }): Promise<PersistedDomainValidationFinding> {
    await this.assertFindingBelongs(projectId, findingId);
    const updated = await this.prisma.dominioValidacionHallazgo.update({
      where: { id: findingId },
      data: {
        estado: EstadoHallazgo.ABIERTO,
        justificacion: null,
        actorUltimaActualizacionId: actorId,
      },
      include: { regla: true },
    });
    return this.mapRows([updated])[0];
  }

  async getFindingById(
    projectId: string,
    findingId: string,
  ): Promise<PersistedDomainValidationFinding | null> {
    const row = await this.prisma.dominioValidacionHallazgo.findFirst({
      where: { id: findingId, proyectoId: projectId },
      include: { regla: true },
    });
    return row ? this.mapRows([row])[0] : null;
  }

  private async assertFindingBelongs(projectId: string, findingId: string) {
    const exists = await this.prisma.dominioValidacionHallazgo.findFirst({
      where: { id: findingId, proyectoId: projectId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Hallazgo no encontrado en el proyecto');
    }
  }

  private mapRows(
    rows: (Prisma.DominioValidacionHallazgoGetPayload<{
      include: { regla: true };
    }> & {
      regla: {
        nombre: string;
        descripcion: string;
        categoria: CategoriaValidacionDominio;
        severidad: Severidad;
        sugerencia: string | null;
      };
    })[],
  ): PersistedDomainValidationFinding[] {
    return rows.map((row) => ({
      id: row.id,
      ruleCode: row.reglaCodigo,
      ruleName: row.regla.nombre,
      category: mapCategory(row.regla.categoria),
      severity: mapSeverity(row.severidad),
      message: row.descripcion,
      elementType: row.elementoTipo,
      elementId: row.elementoId ?? null,
      elementName: row.elementoNombre ?? null,
      suggestion: row.sugerencia ?? row.regla.sugerencia ?? null,
      elementPath: row.elementoPath,
      state: mapState(row.estado),
      justification: row.justificacion ?? null,
      updatedAt: row.actualizadoEn,
      createdAt: row.creadoEn,
    }));
  }

  private sortFindings = (
    a: DomainValidationFindingRecord,
    b: DomainValidationFindingRecord,
  ): number => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    const stateDiff = stateOrder[a.state] - stateOrder[b.state];
    if (stateDiff !== 0) return stateDiff;

    const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryDiff !== 0) return categoryDiff;

    return a.elementPath.localeCompare(b.elementPath);
  };

  private buildKey(ruleCode: string, elementPath: string): string {
    return `${ruleCode}::${elementPath}`;
  }
}
