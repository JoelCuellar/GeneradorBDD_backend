import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { INVITATION_REPOSITORY, type InvitationRepository } from '../domain/invitation.repository';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

export type CreateInvitationDto = {
  projectId: string;
  actorId: string;
  email: string;
  role: 'PROPIETARIO'|'EDITOR'|'LECTOR';
  expiresInHours?: number;
};

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(INVITATION_REPOSITORY) private readonly repo: InvitationRepository,
    private readonly realtime: RealtimeGateway,
  ) {}

  async execute(dto: CreateInvitationDto) {
    const project = await this.prisma.proyecto.findUnique({ where: { id: dto.projectId } });
    if (!project || project.propietarioId !== dto.actorId) {
      throw new Error('No autorizado para invitar en este proyecto');
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = dto.expiresInHours ? new Date(Date.now() + dto.expiresInHours * 3600_000) : null;
    const email = dto.email.trim().toLowerCase();

    // 1) Crear la invitación
    const inv = await this.repo.create({
      projectId: dto.projectId,
      email,
      role: dto.role,
      token,
      createdById: dto.actorId,
      expiresAt,
    });

    // 2) Si el usuario ya existe, notificar en vivo
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (user) this.realtime.notifyInvitationCreated(user.id, inv);

    return inv;
  }
}
