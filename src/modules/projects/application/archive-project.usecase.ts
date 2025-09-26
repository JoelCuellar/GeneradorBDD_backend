import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArchiveProjectInput,
  PROJECT_REPOSITORY,
} from '../domain/project.repository';
import type { ProjectRepository } from '../domain/project.repository';

export interface ArchiveProjectDto extends ArchiveProjectInput {}

@Injectable()
export class ArchiveProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepository,
  ) {}

  async execute(input: ArchiveProjectDto) {
    await this.repo.ensureOwnerExists(input.ownerId);

    const project = await this.repo.findOwnedById(
      input.projectId,
      input.ownerId,
    );
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.archived) {
      throw new BadRequestException('El proyecto ya se encuentra archivado');
    }

    return this.repo.archive({ projectId: project.id, ownerId: input.ownerId });
  }
}
