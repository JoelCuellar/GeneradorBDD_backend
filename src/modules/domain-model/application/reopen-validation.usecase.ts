import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DOMAIN_VALIDATION_REPOSITORY } from '../domain/domain-validation.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';
import type { DomainValidationRepository } from '../domain/domain-validation.repository';

export interface ReopenValidationFindingInput {
  projectId: string;
  actorId: string;
  findingId: string;
}

@Injectable()
export class ReopenDomainValidationUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly domainRepo: DomainModelRepository,
    @Inject(DOMAIN_VALIDATION_REPOSITORY)
    private readonly validationRepo: DomainValidationRepository,
  ) {}

  async execute(input: ReopenValidationFindingInput) {
    await this.domainRepo.ensureEditorAccess(input.projectId, input.actorId);
    return this.validationRepo.reopenFinding({
      projectId: input.projectId,
      findingId: input.findingId,
      actorId: input.actorId,
    });
  }
}
