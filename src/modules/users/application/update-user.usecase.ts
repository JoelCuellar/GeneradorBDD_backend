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

export interface UpdateUserInputDto {
  actorId: string;
  projectId: string;
  userId: string;
  email?: string;
  name?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: UpdateUserInputDto) {
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

    const nextEmail = input.email ?? details.user.email;
    const nextName = this.resolveName(nextEmail, input.name ?? details.user.name);

    await this.repo.update({
      id: input.userId,
      actorId: input.actorId,
      email: nextEmail,
      name: nextName,
    });

    return this.repo.findDetailsById(input.userId);
  }

  private resolveName(email: string, name?: string) {
    const trimmed = name?.trim();
    if (trimmed && trimmed.length > 0) return trimmed;
    const [localPart] = email.split('@');
    return localPart ?? email;
  }
}
