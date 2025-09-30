import type { ProjectInvitation } from "./invitation.entity";
export const INVITATION_REPOSITORY = Symbol('INVITATION_REPOSITORY');

export interface CreateInvitationInput {
  projectId: string;
  email: string;
  role: 'PROPIETARIO' | 'EDITOR' | 'LECTOR';
  token: string;
  createdById: string;
  expiresAt?: Date | null;
}

export interface InvitationRepository {
  create(input: CreateInvitationInput): Promise<ProjectInvitation>;
  findByToken(token: string): Promise<ProjectInvitation | null>;
  listPendingForProject(projectId: string): Promise<ProjectInvitation[]>;
  listPendingForEmail(email: string): Promise<ProjectInvitation[]>;
  markAccepted(id: string, acceptedById: string): Promise<ProjectInvitation>;
  cancel(id: string): Promise<ProjectInvitation>;
}
