export enum UserStatus {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  ELIMINADO = 'ELIMINADO',
}

export enum UserAuditAction {
  CREACION = 'CREACION',
  INVITACION = 'INVITACION',
  ACTUALIZACION_DATOS = 'ACTUALIZACION_DATOS',
  CAMBIO_ROL = 'CAMBIO_ROL',
  ACTIVACION = 'ACTIVACION',
  SUSPENSION = 'SUSPENSION',
  BAJA_LOGICA = 'BAJA_LOGICA',
}

export const PROJECT_ROLES = ['PROPIETARIO', 'EDITOR', 'LECTOR'] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export interface ProjectMembershipSnapshot {
  projectId: string;
  projectName: string;
  role: ProjectRole;
  active: boolean;
  assignedAt: Date;
}

export interface UserAuditRecord {
  id: string;
  action: UserAuditAction;
  actorId: string | null;
  actorName: string | null;
  detail: Record<string, unknown> | null;
  createdAt: Date;
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public status: UserStatus = UserStatus.ACTIVO,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date | null = null,
    public readonly suspendedAt: Date | null = null,
    public readonly deletedAt: Date | null = null,
    public passwordHash: string | null = null,
  ) {}

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVO;
  }
}
