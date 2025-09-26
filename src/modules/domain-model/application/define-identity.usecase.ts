import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface DefineIdentityUseCaseInput {
  projectId: string;
  actorId: string;
  classId: string;
  identityId?: string;
  name: string;
  description?: string | null;
  attributeIds: string[];
}

@Injectable()
export class DefineIdentityUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: DefineIdentityUseCaseInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);

    if (!Array.isArray(input.attributeIds) || input.attributeIds.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos un atributo');
    }

    const name = input.name?.trim();
    if (!name)
      throw new BadRequestException('El nombre de la identidad es obligatorio');

    return this.repo.defineIdentity({
      projectId: input.projectId,
      actorId: input.actorId,
      classId: input.classId,
      identityId: input.identityId,
      name,
      description: input.description?.trim() ?? null,
      attributeIds: input.attributeIds,
    });
  }
}
