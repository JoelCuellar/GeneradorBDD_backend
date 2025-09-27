import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/create-user.usecase';
import {
  AssignProjectRoleUseCase,
  type AssignProjectRoleInputDto,
} from '../../application/assign-project-role.usecase';
import {
  UpdateUserUseCase,
  type UpdateUserInputDto,
} from '../../application/update-user.usecase';
import {
  ChangeUserStatusUseCase,
  type ChangeUserStatusInputDto,
} from '../../application/change-user-status.usecase';
import {
  SoftDeleteUserUseCase,
  type SoftDeleteUserInputDto,
} from '../../application/soft-delete-user.usecase';
import {
  ListUsersUseCase,
  type ListUsersInputDto,
} from '../../application/list-users.usecase';
import {
  GetUserDetailsUseCase,
  type GetUserDetailsInputDto,
} from '../../application/get-user-details.usecase';
import {
  GetUserHistoryUseCase,
  type GetUserHistoryInputDto,
} from '../../application/get-user-history.usecase';
import {
  RemoveProjectCollaboratorUseCase,
  type RemoveProjectCollaboratorInputDto,
} from '../../application/remove-project-collaborator.usecase';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { PROJECT_ROLES, UserStatus } from '../../domain/user.entity';
import type { ProjectRole } from '../../domain/user.entity';
class ActorProjectDto {
  @IsUUID()
  actorId!: string;

  @IsUUID()
  projectId!: string;
}

class CreateUserDto extends ActorProjectDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsIn(PROJECT_ROLES)
  role!: ProjectRole;
}

class ListUsersQueryDto extends ActorProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsIn(PROJECT_ROLES)
  role?: ProjectRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

class UpdateUserDto extends ActorProjectDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

class AssignRoleDto extends ActorProjectDto {
  @IsIn(PROJECT_ROLES)
  role!: ProjectRole;
}

class ChangeStatusDto extends ActorProjectDto {
  @IsEnum(UserStatus)
  status!: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

class SoftDeleteDto extends ActorProjectDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly assignRole: AssignProjectRoleUseCase,
    private readonly changeStatus: ChangeUserStatusUseCase,
    private readonly softDelete: SoftDeleteUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUserDetails: GetUserDetailsUseCase,
    private readonly getUserHistory: GetUserHistoryUseCase,
    private readonly removeCollaborator: RemoveProjectCollaboratorUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    const { actorId, projectId, ...filters } = query;
    const payload: ListUsersInputDto = {
      actorId,
      projectId,
      filters,
    };
    return this.listUsers.execute(payload);
  }

  @Get(':id')
  get(@Param('id') id: string, @Query() query: ActorProjectDto) {
    const payload: GetUserDetailsInputDto = {
      actorId: query.actorId,
      projectId: query.projectId,
      userId: id,
    };
    return this.getUserDetails.execute(payload);
  }

  @Get(':id/history')
  history(@Param('id') id: string, @Query() query: ActorProjectDto) {
    const payload: GetUserHistoryInputDto = {
      actorId: query.actorId,
      projectId: query.projectId,
      userId: id,
    };
    return this.getUserHistory.execute(payload);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const payload: UpdateUserInputDto = {
      actorId: dto.actorId,
      projectId: dto.projectId,
      userId: id,
      email: dto.email,
      name: dto.name,
    };
    return this.updateUser.execute(payload);
  }

  @Patch(':id/role')
  changeRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    const payload: AssignProjectRoleInputDto = {
      actorId: dto.actorId,
      projectId: dto.projectId,
      userId: id,
      role: dto.role,
    };
    return this.assignRole.execute(payload);
  }

  @Patch(':id/status')
  changeUserStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    const payload: ChangeUserStatusInputDto = {
      actorId: dto.actorId,
      projectId: dto.projectId,
      userId: id,
      status: dto.status,
      reason: dto.reason,
    };
    return this.changeStatus.execute(payload);
  }

  @Patch(':id/collaboration/remove')
  removeCollaboration(@Param('id') id: string, @Body() dto: ActorProjectDto) {
    const payload: RemoveProjectCollaboratorInputDto = {
      actorId: dto.actorId,
      projectId: dto.projectId,
      userId: id,
    };
    return this.removeCollaborator.execute(payload);
  }

  @Patch(':id/delete')
  delete(@Param('id') id: string, @Body() dto: SoftDeleteDto) {
    const payload: SoftDeleteUserInputDto = {
      actorId: dto.actorId,
      projectId: dto.projectId,
      userId: id,
      reason: dto.reason,
    };
    return this.softDelete.execute(payload);
  }
}
