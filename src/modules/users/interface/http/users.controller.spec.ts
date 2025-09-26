/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../../application/create-user.usecase';
import { AssignProjectRoleUseCase } from '../../application/assign-project-role.usecase';
import { UpdateUserUseCase } from '../../application/update-user.usecase';
import { ChangeUserStatusUseCase } from '../../application/change-user-status.usecase';
import { SoftDeleteUserUseCase } from '../../application/soft-delete-user.usecase';
import { ListUsersUseCase } from '../../application/list-users.usecase';
import { GetUserDetailsUseCase } from '../../application/get-user-details.usecase';
import { GetUserHistoryUseCase } from '../../application/get-user-history.usecase';

describe('UsersController', () => {
  let controller: UsersController;
  let createUser: CreateUserUseCase;
  let listUsers: ListUsersUseCase;
  let getUserDetails: GetUserDetailsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: AssignProjectRoleUseCase, useValue: { execute: jest.fn() } },
        { provide: ChangeUserStatusUseCase, useValue: { execute: jest.fn() } },
        { provide: SoftDeleteUserUseCase, useValue: { execute: jest.fn() } },
        { provide: ListUsersUseCase, useValue: { execute: jest.fn() } },
        { provide: GetUserDetailsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetUserHistoryUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUser = module.get<CreateUserUseCase>(CreateUserUseCase);
    listUsers = module.get<ListUsersUseCase>(ListUsersUseCase);
    getUserDetails = module.get<GetUserDetailsUseCase>(GetUserDetailsUseCase);
  });

  it('delegates en el caso de uso para crear un usuario', async () => {
    const dto = {
      actorId: 'actor',
      projectId: 'project',
      email: 'nuevo@example.com',
      role: 'EDITOR',
    } as Parameters<UsersController['create']>[0];

    (createUser.execute as jest.Mock).mockResolvedValue('created');

    const result = await controller.create(dto);

    expect(createUser.execute).toHaveBeenCalledWith(dto);
    expect(result).toBe('created');
  });

  it('pasa filtros al listar usuarios', async () => {
    const query = {
      actorId: 'actor',
      projectId: 'project',
      status: 'ACTIVO',
    } as Parameters<UsersController['list']>[0];

    (listUsers.execute as jest.Mock).mockResolvedValue([]);

    await controller.list(query);

    expect(listUsers.execute).toHaveBeenCalledWith({
      actorId: 'actor',
      projectId: 'project',
      filters: { status: 'ACTIVO' },
    });
  });

  it('obtiene detalles de usuario desde el caso de uso', async () => {
    const params = 'user-1';
    const query = { actorId: 'actor', projectId: 'project' } as Parameters<
      UsersController['get']
    >[1];
    (getUserDetails.execute as jest.Mock).mockResolvedValue('detalle');

    const result = await controller.get(params, query);

    expect(getUserDetails.execute).toHaveBeenCalledWith({
      actorId: 'actor',
      projectId: 'project',
      userId: 'user-1',
    });
    expect(result).toBe('detalle');
  });
});
