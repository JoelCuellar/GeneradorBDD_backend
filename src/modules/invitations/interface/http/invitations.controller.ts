import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateInvitationUseCase } from '../../application/create-invitation.usecase';
import { AcceptInvitationUseCase } from '../../application/accept-invitation.usecase';
import { ListInvitationsUseCase } from '../../application/list-invitations.usecase';
import { CancelInvitationUseCase } from '../../application/cancel-invitation.usecase';
import { IsEmail, IsEnum, IsInt, IsOptional, IsUUID, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RolProyecto } from '@prisma/client';

class CreateInvitationFullBodyDto {
  @IsUUID() projectId!: string;
  @IsUUID() actorId!: string;
  @IsEmail() email!: string;
  @IsEnum(RolProyecto) role!: RolProyecto;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) expiresInHours?: number;
}

class AcceptInvitationFullBodyDto {
  @IsUUID() actorId!: string;
  @IsString() @Length(10, 200) token!: string; // tu token hex entra aquí
}

@Controller()
export class InvitationsController {
  constructor(
    private readonly createInv: CreateInvitationUseCase,
    private readonly acceptInv: AcceptInvitationUseCase,
    private readonly listInv: ListInvitationsUseCase,
    private readonly cancelInv: CancelInvitationUseCase,
  ) {}

  // ====== NUEVOS ENDPOINTS solo-body ======

  @Post('invitations')
  async createFromBody(@Body() body: CreateInvitationFullBodyDto) {
    const inv = await this.createInv.execute({
      projectId: body.projectId,
      actorId: body.actorId,
      email: body.email,
      role: body.role,
      expiresInHours: body.expiresInHours,
    });
    return { invitation: inv, acceptUrl: `/invite/${inv.token}` };
  }

  @Post('invitations/accept')
  acceptFromBody(@Body() body: AcceptInvitationFullBodyDto) {
    return this.acceptInv.execute({ token: body.token, actorId: body.actorId });
  }

  // ====== (Opcional) Deja los antiguos si ya estaban en uso ======
  @Post('projects/:projectId/invitations')
  async createLegacy(@Param('projectId') projectId: string, @Body() body: Omit<CreateInvitationFullBodyDto,'projectId'>) {
    const inv = await this.createInv.execute({ projectId, ...body });
    return { invitation: inv, acceptUrl: `/invite/${inv.token}` };
  }

  @Get('projects/:projectId/invitations')
  listForProject(@Param('projectId') projectId: string) {
    return this.listInv.forProject(projectId);
  }

  @Get('invitations/:token')
  getByToken(@Param('token') token: string) {
    return this.listInv.getByToken(token);
  }

  @Patch('invitations/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.cancelInv.execute({ invitationId: id });
  }
}
