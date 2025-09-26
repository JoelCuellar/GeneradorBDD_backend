import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface DeleteDomainClassInput {
  projectId: string;
  actorId: string;
  classId: string;
}

@Injectable()
export class DeleteDomainClassUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: DeleteDomainClassInput): Promise<void> {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);
    await this.repo.deleteClass({
      projectId: input.projectId,
      actorId: input.actorId,
      classId: input.classId,
    });
  }
}
