import {
  DomainValidationCategory,
  DomainValidationFinding,
  DomainValidationFindingRecord,
  DomainValidationRule,
  DomainValidationSeverity,
  DomainValidationState,
} from './domain-validation.entity';

export interface DomainValidationRuleDefinition extends DomainValidationRule {}

export interface PersistedDomainValidationFinding
  extends DomainValidationFindingRecord {}

export interface DomainValidationRepository {
  listFindings(projectId: string): Promise<PersistedDomainValidationFinding[]>;
  syncFindings(options: {
    projectId: string;
    actorId: string;
    rules: DomainValidationRuleDefinition[];
    findings: DomainValidationFinding[];
  }): Promise<PersistedDomainValidationFinding[]>;
  ignoreFinding(options: {
    projectId: string;
    findingId: string;
    actorId: string;
    justification: string;
  }): Promise<PersistedDomainValidationFinding>;
  reopenFinding(options: {
    projectId: string;
    findingId: string;
    actorId: string;
  }): Promise<PersistedDomainValidationFinding>;
  getFindingById(
    projectId: string,
    findingId: string,
  ): Promise<PersistedDomainValidationFinding | null>;
}

export const DOMAIN_VALIDATION_REPOSITORY = Symbol(
  'DOMAIN_VALIDATION_REPOSITORY',
);

export const severityOrder: Record<DomainValidationSeverity, number> = {
  ERROR: 0,
  ADVERTENCIA: 1,
  INFO: 2,
};

export const categoryOrder: Record<DomainValidationCategory, number> = {
  SINTAXIS: 0,
  INTEGRIDAD: 1,
  NORMALIZACION: 2,
  ANTIPATRONES: 3,
};

export const stateOrder: Record<DomainValidationState, number> = {
  ABIERTO: 0,
  IGNORADO: 1,
  RESUELTO: 2,
};
