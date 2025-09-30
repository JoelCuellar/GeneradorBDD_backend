// src/modules/invitations/invitations.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { InvitationsController } from './interface/http/invitations.controller';
import { CreateInvitationUseCase } from './application/create-invitation.usecase';
import { AcceptInvitationUseCase } from './application/accept-invitation.usecase';
import { ListInvitationsUseCase } from './application/list-invitations.usecase';
import { CancelInvitationUseCase } from './application/cancel-invitation.usecase';
import { INVITATION_REPOSITORY } from './domain/invitation.repository';
import { PrismaInvitationRepository } from './infrastructure/prisma-invitation.repository';
import { RealtimeModule } from 'src/realtime/realtime.module'; // 👈 IMPORTA

@Module({
  imports: [RealtimeModule], // 👈 AGREGA ESTO
  controllers: [InvitationsController],
  providers: [
    PrismaService,
    { provide: INVITATION_REPOSITORY, useClass: PrismaInvitationRepository },
    CreateInvitationUseCase,
    AcceptInvitationUseCase,
    ListInvitationsUseCase,
    CancelInvitationUseCase,
  ],
})
export class InvitationsModule {}
