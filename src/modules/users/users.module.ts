import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { UsersController } from './interface/http/users.controller';
import { CreateUserUseCase } from './application/create-user.usecase';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { UpdateUserUseCase } from './application/update-user.usecase';
import { AssignProjectRoleUseCase } from './application/assign-project-role.usecase';
import { ChangeUserStatusUseCase } from './application/change-user-status.usecase';
import { SoftDeleteUserUseCase } from './application/soft-delete-user.usecase';
import { ListUsersUseCase } from './application/list-users.usecase';
import { GetUserDetailsUseCase } from './application/get-user-details.usecase';
import { GetUserHistoryUseCase } from './application/get-user-history.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    AssignProjectRoleUseCase,
    ChangeUserStatusUseCase,
    SoftDeleteUserUseCase,
    ListUsersUseCase,
    GetUserDetailsUseCase,
    GetUserHistoryUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
})
export class UsersModule {}
