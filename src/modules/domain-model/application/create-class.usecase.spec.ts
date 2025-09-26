/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { CreateDomainClassUseCase } from './create-class.usecase';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DomainClass } from '../domain/domain-model.entity';
import type { DomainModelRepository } from '../domain/domain-model.repository';

describe('CreateDomainClassUseCase', () => {
  const projectId = 'project-1';
  const actorId = 'actor-1';
  let repo: jest.Mocked<DomainModelRepository>;
  let useCase: CreateDomainClassUseCase;

  beforeEach(() => {
    repo = {
      ensureEditorAccess: jest
        .fn()
        .mockResolvedValue({ actorId, membershipId: 'membership' }),
      getModel: jest.fn(),
      findClassById: jest.fn(),
      findClassByName: jest.fn(),
      createClass: jest.fn(),
      updateClass: jest.fn(),
      deleteClass: jest.fn(),
      createAttribute: jest.fn(),
      updateAttribute: jest.fn(),
      deleteAttribute: jest.fn(),
      createRelation: jest.fn(),
      updateRelation: jest.fn(),
      deleteRelation: jest.fn(),
      defineIdentity: jest.fn(),
      removeIdentity: jest.fn(),
    } as unknown as jest.Mocked<DomainModelRepository>;
    useCase = new CreateDomainClassUseCase(repo);
  });

  it('crea una clase cuando los datos son validos', async () => {
    const domainClass = {
      id: 'class-1',
      projectId,
      name: 'Nueva',
      description: null,
      attributes: [],
      identities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies DomainClass;

    repo.createClass.mockResolvedValue(domainClass);

    const result = await useCase.execute({
      projectId,
      actorId,
      name: '  Nueva  ',
    });

    expect(repo.ensureEditorAccess).toHaveBeenCalledWith(projectId, actorId);
    expect(repo.createClass).toHaveBeenCalledWith({
      projectId,
      actorId,
      name: 'Nueva',
      description: null,
    });
    expect(result).toBe(domainClass);
  });

  it('lanza error si el nombre esta vacio', async () => {
    await expect(
      useCase.execute({ projectId, actorId, name: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.createClass).not.toHaveBeenCalled();
  });
});
