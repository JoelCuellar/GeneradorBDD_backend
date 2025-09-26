import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import { ProjectMembershipSnapshot, ProjectRole } from '../domain/user.entity';

export interface AssignProjectRoleInputDto {
  actorId: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
}

@Injectable()
export class AssignProjectRoleUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  execute(input: AssignProjectRoleInputDto): Promise<ProjectMembershipSnapshot> {
    return this.repo.assignProjectRole(input);
  }
}
