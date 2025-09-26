import {
  DomainAttributeType,
  DomainModelSnapshot,
} from './domain-model.entity';
import {
  DomainValidationCategory,
  DomainValidationFinding,
  DomainValidationRule,
  DomainValidationSeverity,
} from './domain-validation.entity';

export interface DomainValidationRuleSpec extends DomainValidationRule {
  evaluate(snapshot: DomainModelSnapshot): DomainValidationFinding[];
}

const manyMultiplicity = new Set(['UNO_O_MAS', 'CERO_O_MAS']);

const rules: DomainValidationRuleSpec[] = [
  {
    code: 'DM_CLASS_NO_IDENTITY',
    name: 'Clases sin identidad definida',
    description:
      'Cada clase debe contar con al menos una identidad primaria que defina su clave única.',
    category: 'INTEGRIDAD',
    severity: 'ERROR',
    suggestion:
      'Defina una identidad primaria para la clase agregando una clave única o marcando los atributos correspondientes.',
    evaluate(snapshot) {
      return snapshot.classes
        .filter((clazz) => clazz.identities.length === 0)
        .map((clazz) => ({
          ruleCode: 'DM_CLASS_NO_IDENTITY',
          ruleName: 'Clases sin identidad definida',
          category: 'INTEGRIDAD' as DomainValidationCategory,
          severity: 'ERROR' as DomainValidationSeverity,
          message: `La clase "${clazz.name}" no posee una identidad definida.`,
          elementType: 'CLASS',
          elementId: clazz.id,
          elementName: clazz.name,
          elementPath: `CLASS:${clazz.id}`,
          suggestion: 'Cree una identidad que represente la clave primaria de la clase.',
        }));
    },
  },
  {
    code: 'DM_RELATION_MANY_TO_MANY',
    name: 'Relaciones potencialmente muchos a muchos',
    description:
      'Las relaciones cuyo origen y destino permiten más de un elemento pueden requerir una entidad puente explícita.',
    category: 'ANTIPATRONES',
    severity: 'ADVERTENCIA',
    suggestion:
      'Considere modelar una entidad intermedia que materialice la relación y permita atributos adicionales.',
    evaluate(snapshot) {
      return snapshot.relations
        .filter(
          (relation) =>
            manyMultiplicity.has(relation.sourceMultiplicity) &&
            manyMultiplicity.has(relation.targetMultiplicity),
        )
        .map((relation) => ({
          ruleCode: 'DM_RELATION_MANY_TO_MANY',
          ruleName: 'Relaciones potencialmente muchos a muchos',
          category: 'ANTIPATRONES' as DomainValidationCategory,
          severity: 'ADVERTENCIA' as DomainValidationSeverity,
          message:
            'La relación permite múltiples elementos en ambos extremos. Evalúe si requiere una entidad puente.',
          elementType: 'RELATION',
          elementId: relation.id,
          elementName: relation.name ?? undefined,
          elementPath: `RELATION:${relation.id}`,
          suggestion:
            'Cree una entidad que represente la relación y traslade los atributos a ella.',
        }));
    },
  },
  {
    code: 'DM_RELATION_AMBIGUOUS_ROLE',
    name: 'Relaciones sin roles ni nombre',
    description:
      'Las relaciones sin nombre ni roles dificultan la comprensión del modelo y pueden generar ambigüedad.',
    category: 'SINTAXIS',
    severity: 'ADVERTENCIA',
    suggestion: 'Asigne un nombre o roles descriptivos a la relación.',
    evaluate(snapshot) {
      return snapshot.relations
        .filter(
          (relation) =>
            !relation.name &&
            !relation.sourceRole &&
            !relation.targetRole,
        )
        .map((relation) => ({
          ruleCode: 'DM_RELATION_AMBIGUOUS_ROLE',
          ruleName: 'Relaciones sin roles ni nombre',
          category: 'SINTAXIS' as DomainValidationCategory,
          severity: 'ADVERTENCIA' as DomainValidationSeverity,
          message:
            'Asigne un nombre o roles a la relación para clarificar su propósito en el modelo.',
          elementType: 'RELATION',
          elementId: relation.id,
          elementName: relation.name ?? undefined,
          elementPath: `RELATION:${relation.id}`,
          suggestion: 'Defina roles de relación o un nombre significativo.',
        }));
    },
  },
  {
    code: 'DM_ATTRIBUTE_DUPLICATED_NAME',
    name: 'Atributos duplicados en una misma clase',
    description:
      'Los atributos deben poseer nombres únicos dentro de su clase para evitar ambigüedad.',
    category: 'SINTAXIS',
    severity: 'ERROR',
    suggestion: 'Renombre o elimine los atributos duplicados dentro de la clase.',
    evaluate(snapshot) {
      const findings: DomainValidationFinding[] = [];
      snapshot.classes.forEach((clazz) => {
        const seen = new Map<string, string>();
        clazz.attributes.forEach((attr) => {
          const key = attr.name.trim().toLowerCase();
          const existingId = seen.get(key);
          if (existingId) {
            findings.push({
              ruleCode: 'DM_ATTRIBUTE_DUPLICATED_NAME',
              ruleName: 'Atributos duplicados en una misma clase',
              category: 'SINTAXIS',
              severity: 'ERROR',
              message: `El atributo "${attr.name}" está duplicado en la clase "${clazz.name}".`,
              elementType: 'ATTRIBUTE',
              elementId: attr.id,
              elementName: attr.name,
              elementPath: `CLASS:${clazz.id}:ATTRIBUTE:${attr.id}`,
              suggestion: 'Asegúrese de que los atributos tengan nombres únicos por clase.',
            });
          } else {
            seen.set(key, attr.id);
          }
        });
      });
      return findings;
    },
  },
  {
    code: 'DM_IDENTITY_WITHOUT_ATTRIBUTES',
    name: 'Identidades sin atributos asociados',
    description: 'Las identidades deben contar con al menos un atributo que actúe como clave.',
    category: 'INTEGRIDAD',
    severity: 'ERROR',
    suggestion: 'Agregue atributos a la identidad o elimínela si no aplica.',
    evaluate(snapshot) {
      return snapshot.classes
        .flatMap((clazz) =>
          clazz.identities
            .filter((identity) => identity.attributeIds.length === 0)
            .map((identity) => ({
              ruleCode: 'DM_IDENTITY_WITHOUT_ATTRIBUTES',
              ruleName: 'Identidades sin atributos asociados',
              category: 'INTEGRIDAD' as DomainValidationCategory,
              severity: 'ERROR' as DomainValidationSeverity,
              message: `La identidad "${identity.name}" en la clase "${clazz.name}" no tiene atributos asignados.`,
              elementType: 'IDENTITY',
              elementId: identity.id,
              elementName: identity.name,
              elementPath: `CLASS:${clazz.id}:IDENTITY:${identity.id}`,
              suggestion: 'Seleccione los atributos que conforman la identidad o elimínela.',
            })),
        );
    },
  },
  {
    code: 'DM_ATTRIBUTE_SUSPECT_MULTIVALUE',
    name: 'Atributos potencialmente multivaluados',
    description:
      'Los atributos que aparentan contener múltiples valores podrían incumplir la primera forma normal.',
    category: 'NORMALIZACION',
    severity: 'ADVERTENCIA',
    suggestion: 'Considere normalizar el atributo en una entidad o relación separada.',
    evaluate(snapshot) {
      const findings: DomainValidationFinding[] = [];
      snapshot.classes.forEach((clazz) => {
        clazz.attributes.forEach((attr) => {
          const nameLower = attr.name.toLowerCase();
          const looksPlural =
            nameLower.endsWith('s') || nameLower.includes('lista') || nameLower.includes('list');
          const isTextual =
            attr.type === DomainAttributeType.STRING ||
            attr.type === DomainAttributeType.TEXTO;
          if (looksPlural && isTextual) {
            findings.push({
              ruleCode: 'DM_ATTRIBUTE_SUSPECT_MULTIVALUE',
              ruleName: 'Atributos potencialmente multivaluados',
              category: 'NORMALIZACION',
              severity: 'ADVERTENCIA',
              message: `El atributo "${attr.name}" de la clase "${clazz.name}" podría representar múltiples valores.`,
              elementType: 'ATTRIBUTE',
              elementId: attr.id,
              elementName: attr.name,
              elementPath: `CLASS:${clazz.id}:ATTRIBUTE:${attr.id}`,
              suggestion: 'Evalúe trasladar los valores repetitivos a una entidad relacionada.',
            });
          }
        });
      });
      return findings;
    },
  },
];

export const DOMAIN_VALIDATION_RULES: DomainValidationRuleSpec[] = rules;
