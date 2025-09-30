import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { INVITATION_REPOSITORY, type InvitationRepository } from '../domain/invitation.repository';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

export type AcceptInvitationDto = { token: string; actorId: string };

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(INVITATION_REPOSITORY) private readonly repo: InvitationRepository,
    private readonly realtime: RealtimeGateway,
  ) {}

  async execute(dto: AcceptInvitationDto) {
    const inv = await this.repo.findByToken(dto.token);
    if (!inv || inv.status !== 'PENDIENTE') throw new Error('Invitación inválida');
    if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) throw new Error('Invitación expirada');

    const user = await this.prisma.usuario.findUnique({ where: { id: dto.actorId } });
    if (!user) throw new Error('Usuario no encontrado');

    await this.prisma.proyectoUsuario.upsert({
      where: { proyectoId_usuarioId: { proyectoId: inv.projectId, usuarioId: dto.actorId } },
      create: { proyectoId: inv.projectId, usuarioId: dto.actorId, rol: inv.role as any },
      update: { rol: inv.role as any, activo: true },
    });

    await this.repo.markAccepted(inv.id, dto.actorId);
     this.realtime.notifyMembershipGranted(dto.actorId, { projectId: inv.projectId, role: inv.role });
    // avisar al room del proyecto (opcional)
    this.realtime.broadcast(inv.projectId, 'member_joined', { userId: dto.actorId, role: inv.role });
    return { projectId: inv.projectId, role: inv.role };
  }
}
