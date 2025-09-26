/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DomainModelController } from './domain-model.controller';
import { CreateDomainClassUseCase } from '../../application/create-class.usecase';
import { UpdateDomainClassUseCase } from '../../application/update-class.usecase';
import { DeleteDomainClassUseCase } from '../../application/delete-class.usecase';
import { CreateDomainAttributeUseCase } from '../../application/create-attribute.usecase';
import { UpdateDomainAttributeUseCase } from '../../application/update-attribute.usecase';
import { DeleteDomainAttributeUseCase } from '../../application/delete-attribute.usecase';
import { CreateDomainRelationUseCase } from '../../application/create-relation.usecase';
import { UpdateDomainRelationUseCase } from '../../application/update-relation.usecase';
import { DeleteDomainRelationUseCase } from '../../application/delete-relation.usecase';
import { DefineIdentityUseCase } from '../../application/define-identity.usecase';
import { RemoveIdentityUseCase } from '../../application/remove-identity.usecase';
import { GetDomainModelUseCase } from '../../application/get-domain-model.usecase';

describe('DomainModelController', () => {
  let controller: DomainModelController;
  let getModel: GetDomainModelUseCase;
  let createClass: CreateDomainClassUseCase;
  let createAttribute: CreateDomainAttributeUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainModelController],
      providers: [
        { provide: GetDomainModelUseCase, useValue: { execute: jest.fn() } },
        { provide: CreateDomainClassUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateDomainClassUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteDomainClassUseCase, useValue: { execute: jest.fn() } },
        { provide: CreateDomainAttributeUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateDomainAttributeUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteDomainAttributeUseCase, useValue: { execute: jest.fn() } },
        { provide: CreateDomainRelationUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateDomainRelationUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteDomainRelationUseCase, useValue: { execute: jest.fn() } },
        { provide: DefineIdentityUseCase, useValue: { execute: jest.fn() } },
        { provide: RemoveIdentityUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get(DomainModelController);
    getModel = module.get(GetDomainModelUseCase);
    createClass = module.get(CreateDomainClassUseCase);
    createAttribute = module.get(CreateDomainAttributeUseCase);
  });

  it('obtiene el modelo del dominio', async () => {
    (getModel.execute as jest.Mock).mockResolvedValue('model');

    const result = await controller.getModelEndpoint('project-1', {
      actorId: 'actor-1',
    });

    expect(getModel.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      actorId: 'actor-1',
    });
    expect(result).toBe('model');
  });

  it('crea una clase a través del caso de uso', async () => {
    (createClass.execute as jest.Mock).mockResolvedValue('class');

    const dto = { actorId: 'actor-1', name: 'Clase' } as Parameters<
      DomainModelController['createClassEndpoint']
    >[1];
    const result = await controller.createClassEndpoint('project-1', dto);

    expect(createClass.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      actorId: 'actor-1',
      name: 'Clase',
      description: null,
    });
    expect(result).toBe('class');
  });

  it('crea un atributo a través del caso de uso', async () => {
    (createAttribute.execute as jest.Mock).mockResolvedValue('attribute');

    const dto = {
      actorId: 'actor-1',
      name: 'codigo',
      type: 'STRING',
      required: true,
    } as Parameters<DomainModelController['createAttributeEndpoint']>[2];

    const result = await controller.createAttributeEndpoint(
      'project-1',
      'class-1',
      dto,
    );

    expect(createAttribute.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      actorId: 'actor-1',
      classId: 'class-1',
      name: 'codigo',
      type: 'STRING',
      required: true,
      config: undefined,
    });
    expect(result).toBe('attribute');
  });
});
