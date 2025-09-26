import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DOMAIN_VALIDATION_REPOSITORY } from '../domain/domain-validation.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';
import type { DomainValidationRepository } from '../domain/domain-validation.repository';

export interface ListValidationsInput {
  projectId: string;
  actorId: string;
}

@Injectable()
export class ListDomainValidationsUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly domainRepo: DomainModelRepository,
    @Inject(DOMAIN_VALIDATION_REPOSITORY)
    private readonly validationRepo: DomainValidationRepository,
  ) {}

  async execute(input: ListValidationsInput) {
    await this.domainRepo.ensureViewerAccess(input.projectId, input.actorId);
    return this.validationRepo.listFindings(input.projectId);
  }
}
