import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DomainMultiplicity } from '../domain/domain-model.entity';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface CreateDomainRelationInput {
  projectId: string;
  actorId: string;
  sourceClassId: string;
  targetClassId: string;
  name?: string | null;
  sourceRole?: string | null;
  targetRole?: string | null;
  sourceMultiplicity: string;
  targetMultiplicity: string;
}

@Injectable()
export class CreateDomainRelationUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: CreateDomainRelationInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);

    const sourceMultiplicity = this.parseMultiplicity(input.sourceMultiplicity);
    const targetMultiplicity = this.parseMultiplicity(input.targetMultiplicity);

    return this.repo.createRelation({
      projectId: input.projectId,
      actorId: input.actorId,
      sourceClassId: input.sourceClassId,
      targetClassId: input.targetClassId,
      name: this.normalize(input.name),
      sourceRole: this.normalize(input.sourceRole),
      targetRole: this.normalize(input.targetRole),
      sourceMultiplicity,
      targetMultiplicity,
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
