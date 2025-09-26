import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface DeleteDomainAttributeInput {
  projectId: string;
  actorId: string;
  attributeId: string;
}

@Injectable()
export class DeleteDomainAttributeUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: DeleteDomainAttributeInput): Promise<void> {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);
    await this.repo.deleteAttribute({
      projectId: input.projectId,
      actorId: input.actorId,
      attributeId: input.attributeId,
    });
  }
}
