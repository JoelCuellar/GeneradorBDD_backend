export type DomainValidationSeverity = 'ERROR' | 'ADVERTENCIA' | 'INFO';

export type DomainValidationState = 'ABIERTO' | 'RESUELTO' | 'IGNORADO';

export type DomainValidationCategory =
  | 'SINTAXIS'
  | 'INTEGRIDAD'
  | 'NORMALIZACION'
  | 'ANTIPATRONES';

export interface DomainValidationRule {
  code: string;
  name: string;
  description: string;
  category: DomainValidationCategory;
  severity: DomainValidationSeverity;
  suggestion?: string;
}

export interface DomainValidationFinding {
  ruleCode: string;
  ruleName: string;
  category: DomainValidationCategory;
  severity: DomainValidationSeverity;
  message: string;
  elementType: string;
  elementId?: string | null;
  elementName?: string | null;
  suggestion?: string | null;
  elementPath: string;
}

export interface DomainValidationFindingRecord extends DomainValidationFinding {
  id: string;
  state: DomainValidationState;
  justification: string | null;
  updatedAt: Date;
  createdAt: Date;
}
