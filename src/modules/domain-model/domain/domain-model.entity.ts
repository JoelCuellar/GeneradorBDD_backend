export enum DomainAttributeType {
  STRING = 'STRING',
  ENTERO = 'ENTERO',
  DECIMAL = 'DECIMAL',
  BOOLEANO = 'BOOLEANO',
  FECHA = 'FECHA',
  FECHA_HORA = 'FECHA_HORA',
  UUID = 'UUID',
  TEXTO = 'TEXTO',
}

export enum DomainMultiplicity {
  UNO = 'UNO',
  CERO_O_UNO = 'CERO_O_UNO',
  UNO_O_MAS = 'UNO_O_MAS',
  CERO_O_MAS = 'CERO_O_MAS',
}

export enum DomainAuditAction {
  CLASE_CREADA = 'CLASE_CREADA',
  CLASE_ACTUALIZADA = 'CLASE_ACTUALIZADA',
  CLASE_ELIMINADA = 'CLASE_ELIMINADA',
  ATRIBUTO_CREADO = 'ATRIBUTO_CREADO',
  ATRIBUTO_ACTUALIZADO = 'ATRIBUTO_ACTUALIZADO',
  ATRIBUTO_ELIMINADO = 'ATRIBUTO_ELIMINADO',
  RELACION_CREADA = 'RELACION_CREADA',
  RELACION_ACTUALIZADA = 'RELACION_ACTUALIZADA',
  RELACION_ELIMINADA = 'RELACION_ELIMINADA',
  IDENTIDAD_DEFINIDA = 'IDENTIDAD_DEFINIDA',
  IDENTIDAD_ELIMINADA = 'IDENTIDAD_ELIMINADA',
}

export interface DomainConstraintConfig {
  lengthMin?: number;
  lengthMax?: number;
  min?: number;
  max?: number;
  pattern?: string;
  scale?: number;
  precision?: number;
}

export interface DomainAttribute {
  id: string;
  classId: string;
  name: string;
  type: DomainAttributeType;
  required: boolean;
  config: DomainConstraintConfig | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainIdentity {
  id: string;
  classId: string;
  name: string;
  description: string | null;
  attributeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainClass {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  attributes: DomainAttribute[];
  identities: DomainIdentity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainRelation {
  id: string;
  projectId: string;
  name: string | null;
  sourceClassId: string;
  targetClassId: string;
  sourceRole: string | null;
  targetRole: string | null;
  sourceMultiplicity: DomainMultiplicity;
  targetMultiplicity: DomainMultiplicity;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainModelSnapshot {
  classes: DomainClass[];
  relations: DomainRelation[];
}

export interface DomainAuditRecord {
  id: string;
  projectId: string;
  action: DomainAuditAction;
  entity: string;
  entityId: string;
  actorId: string;
  detail: Record<string, unknown> | null;
  createdAt: Date;
}
