import { Project, ProjectAuditAction, ProjectAuditRecord } from './project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface ListProjectsParams {
  ownerId: string;
  includeArchived?: boolean;
}

export interface CreateProjectInput {
  ownerId: string;
  name: string;
  description: string | null;
}

export interface UpdateProjectInput {
  projectId: string;
  ownerId: string;
  name: string;
  description: string | null;
}

export interface ArchiveProjectInput {
  projectId: string;
  ownerId: string;
}

export interface ProjectRepository {
  ensureOwnerExists(ownerId: string): Promise<void>;
  listByOwner(params: ListProjectsParams): Promise<Project[]>;
  findOwnedById(projectId: string, ownerId: string): Promise<Project | null>;
  findByName(name: string): Promise<Project | null>;
  create(input: CreateProjectInput): Promise<Project>;
  update(input: UpdateProjectInput): Promise<Project>;
  archive(input: ArchiveProjectInput): Promise<Project>;
  getAuditLog(projectId: string, ownerId: string): Promise<ProjectAuditRecord[]>;
  recordAudit(
    projectId: string,
    action: ProjectAuditAction,
    actorId: string,
    detail?: Record<string, unknown>,
  ): Promise<void>;
}
