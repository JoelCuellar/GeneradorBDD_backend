import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type JwtPayload = { sub: string; email?: string };

function bearerTokenFromHeader(h?: unknown): string | undefined {
  if (typeof h !== 'string') return undefined;
  const trimmed = h.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^Bearer\s+/i, '');
}

function tokenFromCookie(cookieHeader?: unknown, name = 'access_token'): string | undefined {
  if (typeof cookieHeader !== 'string') return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1];
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient(); // Socket

    const authToken =
      client.handshake.auth?.token
      ?? bearerTokenFromHeader(client.handshake.headers['authorization'])
      ?? tokenFromCookie(client.handshake.headers.cookie, 'access_token');

    if (!authToken) return false;

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(authToken);
      if (!payload?.sub) return false;

      client.data.userId = payload.sub;

      // Precarga de roles (si ya lo haces aquí, puedes saltarte la query en handleConnection)
      const memberships = await this.prisma.proyectoUsuario.findMany({
        where: { usuarioId: payload.sub, activo: true },
        select: { proyectoId: true, rol: true },
      });

      client.data.projectRoles = memberships.reduce<Record<string, string>>((acc, m) => {
        acc[m.proyectoId] = m.rol; // 'PROPIETARIO' | 'EDITOR' | 'LECTOR'
        return acc;
      }, {});

      return true;
    } catch {
      return false;
    }
  }
}
