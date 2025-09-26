import { Inject, Injectable } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import { DOMAIN_VALIDATION_REPOSITORY } from '../domain/domain-validation.repository';
import { DOMAIN_VALIDATION_RULES } from '../domain/domain-validation.rules';
import type { DomainModelRepository } from '../domain/domain-model.repository';
import type { DomainValidationRepository } from '../domain/domain-validation.repository';

export interface RunValidationsInput {
  projectId: string;
  actorId: string;
}

@Injectable()
export class RunDomainValidationsUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly domainRepo: DomainModelRepository,
    @Inject(DOMAIN_VALIDATION_REPOSITORY)
    private readonly validationRepo: DomainValidationRepository,
  ) {}

  async execute(input: RunValidationsInput) {
    await this.domainRepo.ensureEditorAccess(input.projectId, input.actorId);

    const snapshot = await this.domainRepo.getModel(input.projectId);

    const findings = DOMAIN_VALIDATION_RULES.flatMap((rule) =>
      rule.evaluate(snapshot).map((finding) => ({
        ...finding,
        ruleName: rule.name,
        suggestion: finding.suggestion ?? rule.suggestion ?? null,
      })),
    );

    const unique = new Map<string, (typeof findings)[number]>();
    for (const finding of findings) {
      const key = `${finding.ruleCode}::${finding.elementPath}`;
      unique.set(key, finding);
    }

    const rules = DOMAIN_VALIDATION_RULES.map((rule) => ({
      code: rule.code,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      suggestion: rule.suggestion,
    }));

    return this.validationRepo.syncFindings({
      projectId: input.projectId,
      actorId: input.actorId,
      rules,
      findings: Array.from(unique.values()),
    });
  }
}
