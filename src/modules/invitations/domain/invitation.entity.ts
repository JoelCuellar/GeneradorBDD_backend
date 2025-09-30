export type InvitationStatus = 'PENDIENTE' | 'ACEPTADA' | 'CANCELADA' | 'EXPIRADA';

export type ProjectInvitation = {
  id: string;
  projectId: string;
  email: string;
  role: 'PROPIETARIO' | 'EDITOR' | 'LECTOR';
  token: string;
  status: InvitationStatus;
  createdById: string;
  createdAt: Date;
  expiresAt: Date | null;
  acceptedById?: string | null;
  acceptedAt?: Date | null;
};
