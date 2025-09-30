import { Inject, Injectable } from '@nestjs/common';
import { INVITATION_REPOSITORY, type InvitationRepository } from '../domain/invitation.repository';

@Injectable()
export class ListInvitationsUseCase {
  constructor(@Inject(INVITATION_REPOSITORY) private readonly repo: InvitationRepository) {} // 👈

  forProject(projectId: string) { return this.repo.listPendingForProject(projectId); }
  forEmail(email: string) { return this.repo.listPendingForEmail(email); }
  getByToken(token: string) { return this.repo.findByToken(token); } // 👈 para el controller
}
