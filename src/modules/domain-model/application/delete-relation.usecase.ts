import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface DeleteDomainRelationInput {
  projectId: string;
  actorId: string;
  relationId: string;
}

@Injectable()
export class DeleteDomainRelationUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: DeleteDomainRelationInput): Promise<void> {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);
    await this.repo.deleteRelation({
      projectId: input.projectId,
      actorId: input.actorId,
      relationId: input.relationId,
    });
  }
}
