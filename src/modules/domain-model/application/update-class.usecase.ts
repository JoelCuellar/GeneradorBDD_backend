import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface UpdateDomainClassInput {
  projectId: string;
  actorId: string;
  classId: string;
  name?: string;
  description?: string | null;
}

@Injectable()
export class UpdateDomainClassUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: UpdateDomainClassInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);

    const payload: { name?: string; description?: string | null } = {};

    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed) {
        throw new BadRequestException('El nombre de la clase es obligatorio');
      }
      payload.name = trimmed;
    }

    if (input.description !== undefined) {
      const trimmed = input.description?.trim();
      payload.description = trimmed && trimmed.length > 0 ? trimmed : null;
    }

    return this.repo.updateClass({
      projectId: input.projectId,
      actorId: input.actorId,
      classId: input.classId,
      name: payload.name,
      description: payload.description,
    });
  }
}
