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

export interface SoftDeleteUserInputDto {
  actorId: string;
  projectId: string;
  userId: string;
  reason?: string;
}

@Injectable()
export class SoftDeleteUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: SoftDeleteUserInputDto) {
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

    return this.repo.softDelete({
      actorId: input.actorId,
      userId: input.userId,
      reason: input.reason,
    });
  }
}
