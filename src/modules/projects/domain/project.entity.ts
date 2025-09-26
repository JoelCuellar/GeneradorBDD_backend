export type ProjectStatus = 'ACTIVO' | 'ARCHIVADO';

export enum ProjectAuditAction {
  CREACION = 'CREACION',
  ACTUALIZACION = 'ACTUALIZACION',
  ARCHIVADO = 'ARCHIVADO',
}

export class Project {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public name: string,
    public description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public archived: boolean,
    public archivedAt: Date | null,
  ) {}

  get status(): ProjectStatus {
    return this.archived ? 'ARCHIVADO' : 'ACTIVO';
  }
}

export interface ProjectAuditRecord {
  id: string;
  action: ProjectAuditAction;
  actorId: string | null;
  actorName: string | null;
  detail: Record<string, unknown> | null;
  createdAt: Date;
}
