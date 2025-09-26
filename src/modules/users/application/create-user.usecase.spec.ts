/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase';
import {
  type UserRepository,
  type UserDetails,
} from '../domain/user.repository';
import { User, UserStatus } from '../domain/user.entity';

const actorId = 'actor-1';
const projectId = 'project-1';

const buildRepoMock = (): jest.Mocked<UserRepository> => ({
  findById: jest.fn(),
  findDetailsById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  list: jest.fn(),
  assignProjectRole: jest.fn(),
  changeStatus: jest.fn(),
  softDelete: jest.fn(),
  getAuditLog: jest.fn(),
  recordAudit: jest.fn(),
  ensureActorCanManageProject: jest.fn(),
  validateNotLastOwner: jest.fn(),
});

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repo = buildRepoMock();
    useCase = new CreateUserUseCase(repo);
  });

  it('crea un usuario con el nombre proporcionado', async () => {
    repo.ensureActorCanManageProject.mockResolvedValue();
    repo.findByEmail.mockResolvedValue(null);

    const created = new User('id', 'usuario@example.com', 'Nombre', UserStatus.ACTIVO);
    repo.create.mockResolvedValue(created);

    const expectedDetails: UserDetails = {
      user: created,
      memberships: [],
    };
    repo.assignProjectRole.mockResolvedValue({
      projectId,
      projectName: 'Proyecto Demo',
      role: 'EDITOR',
      active: true,
      assignedAt: new Date(),
    });
    repo.recordAudit.mockResolvedValue();
    repo.findDetailsById.mockResolvedValue(expectedDetails);

    const result = await useCase.execute({
      actorId,
      projectId,
      email: 'usuario@example.com',
      name: 'Nombre Personalizado',
      role: 'EDITOR',
    });

    expect(repo.ensureActorCanManageProject).toHaveBeenCalledWith(actorId, projectId);
    expect(repo.findByEmail).toHaveBeenCalledWith('usuario@example.com');
    expect(repo.create).toHaveBeenCalled();
    expect(repo.assignProjectRole).toHaveBeenCalledWith({
      actorId,
      projectId,
      userId: created.id,
      role: 'EDITOR',
    });
    expect(repo.recordAudit).toHaveBeenCalled();
    expect(result).toBe(expectedDetails);
  });

  it('infere el nombre desde el email cuando no se envía', async () => {
    repo.ensureActorCanManageProject.mockResolvedValue();
    repo.findByEmail.mockResolvedValue(null);

    const created = new User('id2', 'sin.nombre@example.com', 'sin.nombre', UserStatus.ACTIVO);
    repo.create.mockResolvedValue(created);
    repo.assignProjectRole.mockResolvedValue({
      projectId,
      projectName: 'Proyecto Demo',
      role: 'LECTOR',
      active: true,
      assignedAt: new Date(),
    });
    repo.recordAudit.mockResolvedValue();

    const expectedDetails: UserDetails = {
      user: created,
      memberships: [],
    };
    repo.findDetailsById.mockResolvedValue(expectedDetails);

    const result = await useCase.execute({
      actorId,
      projectId,
      email: 'sin.nombre@example.com',
      role: 'LECTOR',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'sin.nombre' }),
      actorId,
    );
    expect(result).toBe(expectedDetails);
  });

  it('lanza una excepción si el email ya está registrado', async () => {
    repo.ensureActorCanManageProject.mockResolvedValue();
    repo.findByEmail.mockResolvedValue(
      new User('1', 'existente@example.com', 'Existente', UserStatus.ACTIVO),
    );

    await expect(
      useCase.execute({
        actorId,
        projectId,
        email: 'existente@example.com',
        role: 'EDITOR',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
