import { Inject, Injectable } from '@nestjs/common';
import {
  ListProjectsParams,
  PROJECT_REPOSITORY,
} from '../domain/project.repository';
import type { ProjectRepository } from '../domain/project.repository';

export interface ListProjectsDto extends ListProjectsParams {}

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepository,
  ) {}

  async execute(input: ListProjectsDto) {
    await this.repo.ensureOwnerExists(input.ownerId);
    return this.repo.listByOwner(input);
  }
}
