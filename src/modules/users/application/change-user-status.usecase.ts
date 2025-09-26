import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import { UserStatus } from '../domain/user.entity';

export interface ChangeUserStatusInputDto {
  actorId: string;
  projectId: string;
  userId: string;
  status: UserStatus;
  reason?: string;
}

@Injectable()
export class ChangeUserStatusUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: ChangeUserStatusInputDto) {
    if (input.status === UserStatus.ELIMINADO) {
      throw new BadRequestException(
        'La baja lógica debe gestionarse mediante el endpoint específico',
      );
    }

    await this.repo.ensureActorCanManageProject(input.actorId, input.projectId);

    const details = await this.repo.findDetailsById(input.userId);
    if (!details) throw new NotFoundException('Usuario no encontrado');

    const belongs = details.memberships.some(
      (membership) => membership.projectId === input.projectId,
    );
    if (!belongs) {
      throw new BadRequestException(
        'El usuario no pertenece al proyecto indicado',
      );
    }

    return this.repo.changeStatus({
      actorId: input.actorId,
      userId: input.userId,
      status: input.status,
      reason: input.reason,
    });
  }
}
