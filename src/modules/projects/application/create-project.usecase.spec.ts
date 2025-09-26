/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { CreateProjectUseCase } from './create-project.usecase';
import { type ProjectRepository } from '../domain/project.repository';
import { Project } from '../domain/project.entity';

const ownerId = 'owner-1';

const buildRepoMock = (): jest.Mocked<ProjectRepository> => ({
  ensureOwnerExists: jest.fn(),
  listByOwner: jest.fn(),
  findOwnedById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
  getAuditLog: jest.fn(),
  recordAudit: jest.fn(),
});

describe('CreateProjectUseCase', () => {
  let repo: jest.Mocked<ProjectRepository>;
  let useCase: CreateProjectUseCase;

  beforeEach(() => {
    repo = buildRepoMock();
    useCase = new CreateProjectUseCase(repo);
  });

  it('crea un proyecto con nombre normalizado', async () => {
    repo.ensureOwnerExists.mockResolvedValue();
    repo.findByName.mockResolvedValue(null);

    const project = new Project(
      'id-1',
      ownerId,
      'Nuevo proyecto',
      'Descripcion',
      new Date(),
      new Date(),
      false,
      null,
    );
    repo.create.mockResolvedValue(project);

    const result = await useCase.execute({
      ownerId,
      name: '  Nuevo proyecto  ',
      description: '  Descripcion  ',
    });

    expect(repo.ensureOwnerExists).toHaveBeenCalledWith(ownerId);
    expect(repo.findByName).toHaveBeenCalledWith('Nuevo proyecto');
    expect(repo.create).toHaveBeenCalledWith({
      ownerId,
      name: 'Nuevo proyecto',
      description: 'Descripcion',
    });
    expect(result).toBe(project);
  });

  it('lanza excepción si el nombre ya existe', async () => {
    repo.ensureOwnerExists.mockResolvedValue();
    repo.findByName.mockResolvedValue(
      new Project('id-2', ownerId, 'Duplicado', null, new Date(), new Date(), false, null),
    );

    await expect(
      useCase.execute({ ownerId, name: 'Duplicado', description: null }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
