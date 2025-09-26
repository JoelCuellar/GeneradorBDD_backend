import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DOMAIN_VALIDATION_REPOSITORY } from '../domain/domain-validation.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';
import type { DomainValidationRepository } from '../domain/domain-validation.repository';

export interface IgnoreValidationFindingInput {
  projectId: string;
  actorId: string;
  findingId: string;
  justification: string;
}

@Injectable()
export class IgnoreDomainValidationUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly domainRepo: DomainModelRepository,
    @Inject(DOMAIN_VALIDATION_REPOSITORY)
    private readonly validationRepo: DomainValidationRepository,
  ) {}

  async execute(input: IgnoreValidationFindingInput) {
    await this.domainRepo.ensureEditorAccess(input.projectId, input.actorId);
    const justification = input.justification?.trim();
    if (!justification) {
      throw new BadRequestException(
        'Debe proporcionar una justificacion para ignorar el hallazgo',
      );
    }
    return this.validationRepo.ignoreFinding({
      projectId: input.projectId,
      findingId: input.findingId,
      actorId: input.actorId,
      justification,
    });
  }
}
