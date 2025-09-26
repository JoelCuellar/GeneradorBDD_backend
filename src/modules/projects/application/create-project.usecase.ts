import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CreateProjectInput,
  PROJECT_REPOSITORY,
} from '../domain/project.repository';
import type { ProjectRepository } from '../domain/project.repository';

export interface CreateProjectDto extends CreateProjectInput {}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepository,
  ) {}

  async execute(input: CreateProjectDto) {
    await this.repo.ensureOwnerExists(input.ownerId);

    const name = this.normalizeName(input.name);
    if (!name) {
      throw new BadRequestException('El nombre del proyecto es obligatorio');
    }

    const description = this.normalizeDescription(input.description);

    const existing = await this.repo.findByName(name);
    if (existing) {
      throw new BadRequestException('El nombre del proyecto ya está en uso');
    }

    return this.repo.create({ ownerId: input.ownerId, name, description });
  }

  private normalizeName(name: string): string {
    return name?.trim() ?? '';
  }

  private normalizeDescription(description: string | null | undefined): string | null {
    const trimmed = description?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }
}
