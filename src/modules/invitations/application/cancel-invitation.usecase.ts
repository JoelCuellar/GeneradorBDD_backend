import { Inject, Injectable } from '@nestjs/common';
import { INVITATION_REPOSITORY, type InvitationRepository } from '../domain/invitation.repository';

export type CancelInvitationDto = { invitationId: string };

@Injectable()
export class CancelInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY) private readonly repo: InvitationRepository, // 👈 FIX
  ) {}

  execute(dto: CancelInvitationDto) {
    return this.repo.cancel(dto.invitationId);
  }
}
