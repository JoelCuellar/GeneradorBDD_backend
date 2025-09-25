/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase';
import { User } from '../domain/user.entity';
import { type UserRepository } from '../domain/user.repository';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    useCase = new CreateUserUseCase(repo);
  });

  it('crea un usuario con el nombre proporcionado', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute({
      email: 'usuario@example.com',
      name: 'Nombre Personalizado',
    });

    expect(repo.findByEmail).toHaveBeenCalledWith('usuario@example.com');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'usuario@example.com',
        name: 'Nombre Personalizado',
      }),
    );
    expect(result.name).toBe('Nombre Personalizado');
  });

  it('infere el nombre desde el email cuando no se envía', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute({ email: 'sin.nombre@example.com' });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'sin.nombre' }),
    );
    expect(result.name).toBe('sin.nombre');
  });

  it('lanza una excepción si el email ya está registrado', async () => {
    repo.findByEmail.mockResolvedValue(
      new User('1', 'existente@example.com', 'Existente'),
    );

    await expect(
      useCase.execute({ email: 'existente@example.com', name: 'Otro' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
