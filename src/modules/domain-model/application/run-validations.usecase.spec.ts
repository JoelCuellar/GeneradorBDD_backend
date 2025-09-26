/* eslint-disable @typescript-eslint/unbound-method */
import { RunDomainValidationsUseCase } from './run-validations.usecase';
import {
  DOMAIN_MODEL_REPOSITORY,
  type DomainModelRepository,
} from '../domain/domain-model.repository';
import {
  DOMAIN_VALIDATION_REPOSITORY,
  type DomainValidationRepository,
} from '../domain/domain-validation.repository';
import {
  DomainAttributeType,
  DomainModelSnapshot,
} from '../domain/domain-model.entity';

describe('RunDomainValidationsUseCase', () => {
  const projectId = 'project-1';
  const actorId = 'actor-1';
  let domainRepo: jest.Mocked<DomainModelRepository>;
  let validationRepo: jest.Mocked<DomainValidationRepository>;
  let useCase: RunDomainValidationsUseCase;

  beforeEach(() => {
    domainRepo = {
      ensureEditorAccess: jest
        .fn()
        .mockResolvedValue({ actorId, membershipId: 'm-1' }),
      ensureViewerAccess: jest.fn(),
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

    validationRepo = {
      listFindings: jest.fn(),
      syncFindings: jest.fn(),
      ignoreFinding: jest.fn(),
      reopenFinding: jest.fn(),
      getFindingById: jest.fn(),
    } as unknown as jest.Mocked<DomainValidationRepository>;

    useCase = new RunDomainValidationsUseCase(domainRepo, validationRepo);
  });

  it('ejecuta las reglas y sincroniza los hallazgos', async () => {
    const snapshot: DomainModelSnapshot = {
      classes: [
        {
          id: 'class-1',
          projectId,
          name: 'Cliente',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          attributes: [
            {
              id: 'att-1',
              classId: 'class-1',
              name: 'id',
              type: DomainAttributeType.UUID,
              required: true,
              config: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          identities: [],
        },
      ],
      relations: [],
    };

    domainRepo.getModel.mockResolvedValue(snapshot);
    validationRepo.syncFindings.mockResolvedValue([]);

    await useCase.execute({ projectId, actorId });

    expect(domainRepo.ensureEditorAccess).toHaveBeenCalledWith(
      projectId,
      actorId,
    );
    expect(domainRepo.getModel).toHaveBeenCalledWith(projectId);

    expect(validationRepo.syncFindings).toHaveBeenCalledTimes(1);
    const payload = validationRepo.syncFindings.mock.calls[0][0];
    expect(payload.projectId).toBe(projectId);
    expect(payload.actorId).toBe(actorId);
    expect(Array.isArray(payload.rules)).toBe(true);
    expect(payload.rules.length).toBeGreaterThan(0);
    expect(Array.isArray(payload.findings)).toBe(true);
    expect(payload.findings.length).toBe(1);
    expect(payload.findings[0].ruleCode).toBe('DM_CLASS_NO_IDENTITY');
    expect(payload.findings[0].elementPath).toBe('CLASS:class-1');
  });
});
