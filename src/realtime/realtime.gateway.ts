// src/realtime/realtime.gateway.ts
import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { OnGatewayConnection } from '@nestjs/websockets';

function canEdit(role?: string) {
  return role === 'PROPIETARIO' || role === 'EDITOR';
}

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
@Injectable()
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() io!: Server;
  constructor(private prisma: PrismaService) {}

  // Al conectar: unir a sala personal y precargar roles por proyecto
  async handleConnection(client: Socket) {
    const userId: string | undefined = client.data?.userId; // <- WsAuthGuard debe setear userId
    if (!userId) {
      client.disconnect(true);
      return;
    }

    // sala por usuario para notificaciones puntuales
    client.join(`user:${userId}`);

    // hidratar roles del usuario para "join" posterior
    const memberships = await this.prisma.proyectoUsuario.findMany({
      where: { usuarioId: userId, activo: true },
      select: { proyectoId: true, rol: true },
    });
    client.data.projectRoles = Object.fromEntries(
      memberships.map(m => [m.proyectoId, m.rol])
    );

    // avisar al cliente que ya puede operar
    client.emit('ready', { projectRoles: client.data.projectRoles });
  }

  // === Rooms por proyecto ===
  @SubscribeMessage('join')
  onJoin(@ConnectedSocket() socket: Socket, @MessageBody() data: { projectId: string }) {
    const role = socket.data.projectRoles?.[data.projectId];
    if (!role) return socket.emit('error', 'No autorizado para este proyecto');
    socket.join(data.projectId);
    socket.emit('joined', { projectId: data.projectId, role });
  }

  // === Presencia (cursores/selección) ===
  @SubscribeMessage('presence')
  onPresence(@ConnectedSocket() socket: Socket, @MessageBody() p: {
    projectId: string; cursor?: { x: number; y: number }; selection?: string | null;
  }) {
    const role = socket.data.projectRoles?.[p.projectId];
    if (!role) return;
    socket.to(p.projectId).emit('presence', {
      userId: socket.data.userId,
      cursor: p.cursor, selection: p.selection,
    });
  }

  // === Movimiento de nodos (efímero) ===
  @SubscribeMessage('node_move')
  onNodeMove(@ConnectedSocket() socket: Socket, @MessageBody() p: {
    projectId: string; classId: string; x: number; y: number;
  }) {
    const role = socket.data.projectRoles?.[p.projectId];
    if (!role) return;
    socket.to(p.projectId).emit('node_move', p);
  }

  // === Movimiento de nodos (commit + persistencia opcional) ===
  @SubscribeMessage('node_move_commit')
  async onNodeMoveCommit(@ConnectedSocket() socket: Socket, @MessageBody() p: {
    projectId: string; classId: string; x: number; y: number;
  }) {
    const role = socket.data.projectRoles?.[p.projectId];
    if (!canEdit(role)) return;

    try {
      await this.prisma.diagramNodeLayout.upsert({
        where: { projectId_classId: { projectId: p.projectId, classId: p.classId } },
        create: { projectId: p.projectId, classId: p.classId, x: Math.round(p.x), y: Math.round(p.y) },
        update: { x: Math.round(p.x), y: Math.round(p.y) },
      });
    } catch {}

    this.io.to(p.projectId).emit('node_move_commit', p);
  }

  // === Anclajes de aristas ===
  @SubscribeMessage('edge_anchor')
  async onEdgeAnchor(@ConnectedSocket() socket: Socket, @MessageBody() p: {
    projectId: string; relationId: string; sourceHandle?: string; targetHandle?: string;
  }) {
    const role = socket.data.projectRoles?.[p.projectId];
    if (!canEdit(role)) return;

    try {
      await this.prisma.diagramEdgeAnchor.upsert({
        where: { projectId_relationId: { projectId: p.projectId, relationId: p.relationId } },
        create: { projectId: p.projectId, relationId: p.relationId, sourceHandle: p.sourceHandle, targetHandle: p.targetHandle },
        update: { sourceHandle: p.sourceHandle, targetHandle: p.targetHandle },
      });
    } catch {}

    this.io.to(p.projectId).emit('edge_anchor', p);
  }

  // ===== Notificaciones puntuales (salas por usuario) =====
  notifyInvitationCreated(userId: string, invitation: any) {
    this.io.to(`user:${userId}`).emit('invitation_created', invitation);
  }

  notifyMembershipGranted(userId: string, payload: { projectId: string; role: string }) {
    // Para clientes ya conectados: actualizan projectRoles sin reconectar
    this.io.to(`user:${userId}`).emit('membership_granted', payload);
  }

  // ===== Broadcasts invocados desde servicios REST =====
  broadcast(projectId: string, event: string, payload: any) {
    this.io.to(projectId).emit(event, payload);
  }
}
