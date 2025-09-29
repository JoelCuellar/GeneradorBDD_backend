// src/realtime/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/shared/prisma/prisma.service';
type JwtPayload = { sub: string; email: string };

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient(); // Socket
    const token: string | undefined =
      client.handshake.auth?.token ||
      client.handshake.headers['authorization']?.toString().replace(/^Bearer\s+/i, '');

    if (!token) return false;

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      client.data.userId = payload.sub;

      // precarga: todos los roles de este usuario por proyecto
      const memberships = await this.prisma.proyectoUsuario.findMany({
        where: { usuarioId: payload.sub, activo: true },
        select: { proyectoId: true, rol: true },
      });

      client.data.projectRoles = memberships.reduce((acc: Record<string, string>, m) => {
          acc[m.proyectoId] = m.rol; // 'PROPIETARIO' | 'EDITOR' | 'LECTOR'
          return acc;
        },
        {},
      );

      return true;
    } catch {
      return false;
    }
  }
}
