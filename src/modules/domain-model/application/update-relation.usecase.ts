import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DomainMultiplicity } from '../domain/domain-model.entity';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface UpdateDomainRelationInput {
  projectId: string;
  actorId: string;
  relationId: string;
  name?: string | null;
  sourceRole?: string | null;
  targetRole?: string | null;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
}

@Injectable()
export class UpdateDomainRelationUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: UpdateDomainRelationInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);

    return this.repo.updateRelation({
      projectId: input.projectId,
      actorId: input.actorId,
      relationId: input.relationId,
      name: input.name !== undefined ? this.normalize(input.name) : undefined,
      sourceRole:
        input.sourceRole !== undefined
          ? this.normalize(input.sourceRole)
          : undefined,
      targetRole:
        input.targetRole !== undefined
          ? this.normalize(input.targetRole)
          : undefined,
      sourceMultiplicity:
        input.sourceMultiplicity !== undefined
          ? this.parseMultiplicity(input.sourceMultiplicity)
          : undefined,
      targetMultiplicity:
        input.targetMultiplicity !== undefined
          ? this.parseMultiplicity(input.targetMultiplicity)
          : undefined,
    });
  }

  private parseMultiplicity(raw: string): DomainMultiplicity {
    const normalized = raw?.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('La multiplicidad es obligatoria');
    }
    if (
      !Object.values(DomainMultiplicity).includes(
        normalized as DomainMultiplicity,
      )
    ) {
      throw new BadRequestException('Multiplicidad no soportada');
    }
    return normalized as DomainMultiplicity;
  }

  private normalize(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }
}
