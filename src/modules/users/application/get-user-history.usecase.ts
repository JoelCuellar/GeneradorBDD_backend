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
import { UserAuditRecord } from '../domain/user.entity';

export interface GetUserHistoryInputDto {
  actorId: string;
  projectId: string;
  userId: string;
}

@Injectable()
export class GetUserHistoryUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: GetUserHistoryInputDto): Promise<UserAuditRecord[]> {
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

    return this.repo.getAuditLog(input.userId);
  }
}
