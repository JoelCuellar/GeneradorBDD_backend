import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface RemoveIdentityUseCaseInput {
  projectId: string;
  actorId: string;
  identityId: string;
}

@Injectable()
export class RemoveIdentityUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: RemoveIdentityUseCaseInput): Promise<void> {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);
    await this.repo.removeIdentity({
      projectId: input.projectId,
      actorId: input.actorId,
      identityId: input.identityId,
    });
  }
}
