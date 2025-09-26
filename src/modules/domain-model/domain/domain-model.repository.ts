import {
  DomainAttribute,
  DomainAttributeType,
  DomainClass,
  DomainConstraintConfig,
  DomainIdentity,
  DomainModelSnapshot,
  DomainRelation,
} from './domain-model.entity';

export const DOMAIN_MODEL_REPOSITORY = Symbol('DOMAIN_MODEL_REPOSITORY');

export interface EditorAccess {
  actorId: string;
  membershipId: string;
}

export interface CreateClassInput {
  projectId: string;
  actorId: string;
  name: string;
  description: string | null;
}

export interface UpdateClassInput {
  projectId: string;
  actorId: string;
  classId: string;
  name?: string;
  description?: string | null;
}

export interface DeleteClassInput {
  projectId: string;
  actorId: string;
  classId: string;
}

export interface CreateAttributeInput {
  projectId: string;
  actorId: string;
  classId: string;
  name: string;
  type: DomainAttributeType;
  required: boolean;
  config: DomainConstraintConfig | null;
}

export interface UpdateAttributeInput {
  projectId: string;
  actorId: string;
  attributeId: string;
  name?: string;
  type?: DomainAttributeType;
  required?: boolean;
  config?: DomainConstraintConfig | null;
}

export interface DeleteAttributeInput {
  projectId: string;
  actorId: string;
  attributeId: string;
}

export interface CreateRelationInput {
  projectId: string;
  actorId: string;
  sourceClassId: string;
  targetClassId: string;
  name: string | null;
  sourceRole: string | null;
  targetRole: string | null;
  sourceMultiplicity: string;
  targetMultiplicity: string;
}

export interface UpdateRelationInput {
  projectId: string;
  actorId: string;
  relationId: string;
  name?: string | null;
  sourceRole?: string | null;
  targetRole?: string | null;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
}

export interface DeleteRelationInput {
  projectId: string;
  actorId: string;
  relationId: string;
}

export interface DefineIdentityInput {
  projectId: string;
  actorId: string;
  classId: string;
  identityId?: string;
  name: string;
  description: string | null;
  attributeIds: string[];
}

export interface RemoveIdentityInput {
  projectId: string;
  actorId: string;
  identityId: string;
}

export interface DomainModelRepository {
  ensureEditorAccess(projectId: string, actorId: string): Promise<EditorAccess>;
  getModel(projectId: string): Promise<DomainModelSnapshot>;
  findClassById(projectId: string, classId: string): Promise<DomainClass | null>;
  findClassByName(projectId: string, name: string): Promise<DomainClass | null>;
  createClass(input: CreateClassInput): Promise<DomainClass>;
  updateClass(input: UpdateClassInput): Promise<DomainClass>;
  deleteClass(input: DeleteClassInput): Promise<void>;

  createAttribute(input: CreateAttributeInput): Promise<DomainAttribute>;
  updateAttribute(input: UpdateAttributeInput): Promise<DomainAttribute>;
  deleteAttribute(input: DeleteAttributeInput): Promise<void>;

  createRelation(input: CreateRelationInput): Promise<DomainRelation>;
  updateRelation(input: UpdateRelationInput): Promise<DomainRelation>;
  deleteRelation(input: DeleteRelationInput): Promise<void>;

  defineIdentity(input: DefineIdentityInput): Promise<DomainIdentity>;
  removeIdentity(input: RemoveIdentityInput): Promise<void>;
}
