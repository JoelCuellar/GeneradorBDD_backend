/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DomainValidationController } from './domain-validation.controller';
import { RunDomainValidationsUseCase } from '../../application/run-validations.usecase';
import { ListDomainValidationsUseCase } from '../../application/list-validations.usecase';
import { IgnoreDomainValidationUseCase } from '../../application/ignore-validation.usecase';
import { ReopenDomainValidationUseCase } from '../../application/reopen-validation.usecase';

describe('DomainValidationController', () => {
  let controller: DomainValidationController;
  let runValidations: RunDomainValidationsUseCase;
  let listValidations: ListDomainValidationsUseCase;
  let ignoreValidation: IgnoreDomainValidationUseCase;
  let reopenValidation: ReopenDomainValidationUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainValidationController],
      providers: [
        { provide: RunDomainValidationsUseCase, useValue: { execute: jest.fn() } },
        { provide: ListDomainValidationsUseCase, useValue: { execute: jest.fn() } },
        { provide: IgnoreDomainValidationUseCase, useValue: { execute: jest.fn() } },
        { provide: ReopenDomainValidationUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get(DomainValidationController);
    runValidations = module.get(RunDomainValidationsUseCase);
    listValidations = module.get(ListDomainValidationsUseCase);
    ignoreValidation = module.get(IgnoreDomainValidationUseCase);
    reopenValidation = module.get(ReopenDomainValidationUseCase);
  });

  it('ejecuta las validaciones del dominio', async () => {
    (runValidations.execute as jest.Mock).mockResolvedValue('result');

    const dto = { actorId: 'actor-1' } as Parameters<
      DomainValidationController['run']
    >[1];

    const response = await controller.run('project-1', dto);

    expect(runValidations.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      actorId: 'actor-1',
    });
    expect(response).toBe('result');
  });

  it('lista los hallazgos existentes', async () => {
    (listValidations.execute as jest.Mock).mockResolvedValue(['hallazgo']);

    await controller.list('project-1', { actorId: 'actor-1' } as Parameters<
      DomainValidationController['list']
    >[1]);

    expect(listValidations.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      actorId: 'actor-1',
    });
  });

  it('ignora un hallazgo con justificacion', async () => {
    (ignoreValidation.execute as jest.Mock).mockResolvedValue('ignored');
    const body = {
      actorId: 'actor-1',
      justification: 'Aceptado por negocio',
    } as Parameters<DomainValidationController['ignore']>[2];

    const result = await controller.ignore('project-1', 'finding-1', body);

    expect(ignoreValidation.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      findingId: 'finding-1',
      actorId: 'actor-1',
      justification: 'Aceptado por negocio',
    });
    expect(result).toBe('ignored');
  });

  it('reabre un hallazgo', async () => {
    (reopenValidation.execute as jest.Mock).mockResolvedValue('reopened');

    const body = { actorId: 'actor-1' } as Parameters<
      DomainValidationController['reopen']
    >[2];

    const response = await controller.reopen('project-1', 'finding-1', body);

    expect(reopenValidation.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      findingId: 'finding-1',
      actorId: 'actor-1',
    });
    expect(response).toBe('reopened');
  });
});
