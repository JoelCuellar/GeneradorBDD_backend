import {
  ProjectMembershipSnapshot,
  ProjectRole,
  User,
  UserAuditAction,
  UserAuditRecord,
  UserStatus,
} from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserFilters {
  name?: string;
  email?: string;
  role?: ProjectRole;
  status?: UserStatus;
}

export interface ListUsersParams {
  projectId: string;
  actorId: string;
  filters?: UserFilters;
}

export interface UserListItem {
  user: User;
  memberships: ProjectMembershipSnapshot[];
}

export interface UserDetails extends UserListItem {}

export interface AssignProjectRoleInput {
  projectId: string;
  userId: string;
  role: ProjectRole;
  actorId: string;
}

export interface RemoveProjectCollaboratorInput {
  projectId: string;
  userId: string;
  actorId: string;
}

export interface ChangeUserStatusInput {
  userId: string;
  actorId: string;
  status: UserStatus;
  reason?: string;
}

export interface SoftDeleteUserInput {
  userId: string;
  actorId: string;
  reason?: string;
}

export interface AuditLogInput {
  userId: string;
  actorId?: string | null;
  action: UserAuditAction;
  detail?: Record<string, unknown>;
}

export interface UpdateUserInput {
  id: string;
  actorId: string;
  email: string;
  name: string;
}

export interface SetUserPasswordInput {
  userId: string;
  passwordHash: string;
  name?: string;
}

export interface CreateAuthUserInput {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findDetailsById(id: string): Promise<UserDetails | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User, actorId: string): Promise<User>;
  createAuthUser(input: CreateAuthUserInput): Promise<User>;
  setUserPassword(input: SetUserPasswordInput): Promise<User>;
  update(input: UpdateUserInput): Promise<User>;
  list(params: ListUsersParams): Promise<UserListItem[]>;
  assignProjectRole(
    input: AssignProjectRoleInput,
  ): Promise<ProjectMembershipSnapshot>;
  removeProjectCollaborator(
    input: RemoveProjectCollaboratorInput,
  ): Promise<ProjectMembershipSnapshot>;
  changeStatus(input: ChangeUserStatusInput): Promise<User>;
  softDelete(input: SoftDeleteUserInput): Promise<User>;
  getAuditLog(userId: string): Promise<UserAuditRecord[]>;
  recordAudit(entry: AuditLogInput): Promise<void>;
  ensureActorCanManageProject(
    actorId: string,
    projectId: string,
  ): Promise<void>;
  validateNotLastOwner(userId: string): Promise<string[]>;
}
