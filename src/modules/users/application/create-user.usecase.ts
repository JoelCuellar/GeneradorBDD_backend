import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import {
  ProjectRole,
  User,
  UserAuditAction,
  UserStatus,
} from '../domain/user.entity';

export interface CreateUserInput {
  actorId: string;
  projectId: string;
  email: string;
  name?: string;
  role: ProjectRole;
}

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: CreateUserInput) {
    await this.repo.ensureActorCanManageProject(input.actorId, input.projectId);

    const exists = await this.repo.findByEmail(input.email);
    if (exists) throw new BadRequestException('Email ya registrado');

    const name = this.resolveName(input.email, input.name);
    const now = new Date();
    const user = new User(
      randomUUID(),
      input.email,
      name,
      UserStatus.ACTIVO,
      now,
      now,
    );

    const created = await this.repo.create(user, input.actorId);
    await this.repo.assignProjectRole({
      actorId: input.actorId,
      projectId: input.projectId,
      role: input.role,
      userId: created.id,
    });

    await this.repo.recordAudit({
      userId: created.id,
      actorId: input.actorId,
      action: UserAuditAction.INVITACION,
      detail: { projectId: input.projectId, rol: input.role },
    });

    return this.repo.findDetailsById(created.id);
  }

  private resolveName(email: string, name?: string) {
    const trimmed = name?.trim();
    if (trimmed && trimmed.length > 0) return trimmed;
    const [localPart] = email.split('@');
    return localPart ?? email;
  }
}
