import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type RemoveProjectCollaboratorInput,
  type UserRepository,
} from '../domain/user.repository';
import { type ProjectMembershipSnapshot } from '../domain/user.entity';

export interface RemoveProjectCollaboratorInputDto {
  actorId: string;
  projectId: string;
  userId: string;
}

@Injectable()
export class RemoveProjectCollaboratorUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  execute(input: RemoveProjectCollaboratorInputDto): Promise<ProjectMembershipSnapshot> {
    const payload: RemoveProjectCollaboratorInput = {
      actorId: input.actorId,
      projectId: input.projectId,
      userId: input.userId,
    };
    return this.repo.removeProjectCollaborator(payload);
  }
}
