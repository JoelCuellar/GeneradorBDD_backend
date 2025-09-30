import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { INVITATION_REPOSITORY, type CreateInvitationInput, type InvitationRepository } from '../domain/invitation.repository';
import { type ProjectInvitation } from '../domain/invitation.entity';

function map(pr: any): ProjectInvitation {
  return {
    id: pr.id,
    projectId: pr.proyectoId,
    email: pr.email,
    role: pr.rol,
    token: pr.token,
    status: pr.estado,
    createdById: pr.creadoPorId,
    createdAt: pr.creadoEn,
    expiresAt: pr.expiraEn,
    acceptedById: pr.aceptadoPorId,
    acceptedAt: pr.aceptadoEn,
  };
}

@Injectable()
export class PrismaInvitationRepository implements InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateInvitationInput) {
    const created = await this.prisma.proyectoInvitacion.create({
      data: {
        proyectoId: input.projectId,
        email: input.email,
        rol: input.role as any,
        token: input.token,
        creadoPorId: input.createdById,
        expiraEn: input.expiresAt ?? null,
      },
    });
    return map(created);
  }

  async findByToken(token: string) {
    const row = await this.prisma.proyectoInvitacion.findUnique({ where: { token } });
    return row ? map(row) : null;
  }

  async listPendingForProject(projectId: string) {
    const rows = await this.prisma.proyectoInvitacion.findMany({ where: { proyectoId: projectId, estado: 'PENDIENTE' } });
    return rows.map(map);
  }

  async listPendingForEmail(email: string) {
    const rows = await this.prisma.proyectoInvitacion.findMany({ where: { email, estado: 'PENDIENTE' } });
    return rows.map(map);
  }

  async markAccepted(id: string, acceptedById: string) {
    const updated = await this.prisma.proyectoInvitacion.update({
      where: { id },
      data: { estado: 'ACEPTADA', aceptadoPorId: acceptedById, aceptadoEn: new Date() },
    });
    return map(updated);
  }

  async cancel(id: string) {
    const updated = await this.prisma.proyectoInvitacion.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    });
    return map(updated);
  }
}
