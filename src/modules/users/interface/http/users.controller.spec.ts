/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../../application/create-user.usecase';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let createUser: CreateUserUseCase;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: USER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUser = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('delegates en el caso de uso para crear un usuario', async () => {
    const dto = {
      email: 'nuevo@example.com',
    } as Parameters<UsersController['create']>[0];
    const created = new User('id', 'nuevo@example.com', 'nuevo');
    (createUser.execute as jest.Mock).mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(createUser.execute).toHaveBeenCalledWith(dto);
    expect(result).toBe(created);
  });

  it('obtiene un usuario desde el repositorio por id', async () => {
    const user = new User('abc', 'abc@example.com', 'abc');
    repository.findById.mockResolvedValue(user);

    await expect(controller.get('abc')).resolves.toBe(user);
    expect(repository.findById).toHaveBeenCalledWith('abc');
  });
});
