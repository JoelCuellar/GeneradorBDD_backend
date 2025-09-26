import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface CreateDomainClassInput {
  projectId: string;
  actorId: string;
  name: string;
  description?: string | null;
}

@Injectable()
export class CreateDomainClassUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: CreateDomainClassInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);

    const name = input.name?.trim();
    if (!name) {
      throw new BadRequestException('El nombre de la clase es obligatorio');
    }
    const description = input.description?.trim();

    return this.repo.createClass({
      projectId: input.projectId,
      actorId: input.actorId,
      name,
      description: description && description.length > 0 ? description : null,
    });
  }
}
