import { Inject, Injectable } from '@nestjs/common';
import {
  type ListUsersParams,
  USER_REPOSITORY,
  type UserFilters,
  type UserListItem,
  type UserRepository,
} from '../domain/user.repository';

export interface ListUsersInputDto {
  actorId: string;
  projectId: string;
  filters?: UserFilters;
}

@Injectable()
export class ListUsersUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  execute(input: ListUsersInputDto): Promise<UserListItem[]> {
    const params: ListUsersParams = {
      actorId: input.actorId,
      projectId: input.projectId,
      filters: input.filters,
    };
    return this.repo.list(params);
  }
}
