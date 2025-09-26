import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../domain/project.repository';
import type { ProjectRepository } from '../domain/project.repository';
export interface UpdateProjectCommand {
  projectId: string;
  ownerId: string;
  name?: string;
  description?: string | null;
}

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepository,
  ) {}

  async execute(input: UpdateProjectCommand) {
    await this.repo.ensureOwnerExists(input.ownerId);

    const project = await this.repo.findOwnedById(
      input.projectId,
      input.ownerId,
    );
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const name = this.normalizeName(input.name ?? project.name);
    if (!name) {
      throw new BadRequestException('El nombre del proyecto es obligatorio');
    }

    const description = this.normalizeDescription(
      input.description !== undefined ? input.description : project.description,
    );

    if (name === project.name && description === project.description) {
      return project;
    }

    if (name !== project.name) {
      const existing = await this.repo.findByName(name);
      if (existing && existing.id !== project.id) {
        throw new BadRequestException('El nombre del proyecto ya está en uso');
      }
    }

    return this.repo.update({
      projectId: project.id,
      ownerId: input.ownerId,
      name,
      description,
    });
  }

  private normalizeName(name: string): string {
    return name?.trim() ?? '';
  }

  private normalizeDescription(
    description: string | null | undefined,
  ): string | null {
    const trimmed = description?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }
}
