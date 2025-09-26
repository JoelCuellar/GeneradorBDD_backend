import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface GetDomainModelInput {
  projectId: string;
  actorId: string;
}

@Injectable()
export class GetDomainModelUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: GetDomainModelInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);
    return this.repo.getModel(input.projectId);
  }
}
