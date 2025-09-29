// src/realtime/realtime.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
import { PrismaService } from 'src/shared/prisma/prisma.service';

function canEdit(role?: string) {
  return role === 'PROPIETARIO' || role === 'EDITOR';
}

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
@Injectable()
export class RealtimeGateway {
  @WebSocketServer() io!: Server;
  constructor(private prisma: PrismaService) {}

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

  // === Movimiento de nodos ===
  @SubscribeMessage('node_move')
  onNodeMove(@ConnectedSocket() socket: Socket, @MessageBody() p: {
    projectId: string; classId: string; x: number; y: number;
  }) {
    const role = socket.data.projectRoles?.[p.projectId];
    if (!role) return;
    socket.to(p.projectId).emit('node_move', p); // efímero
  }

  @SubscribeMessage('node_move_commit')
  async onNodeMoveCommit(@ConnectedSocket() socket: Socket, @MessageBody() p: {
    projectId: string; classId: string; x: number; y: number;
  }) {
    const role = socket.data.projectRoles?.[p.projectId];
    if (!canEdit(role)) return;

    // (opcional) persistencia
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

    // (opcional) persistencia
    try {
      await this.prisma.diagramEdgeAnchor.upsert({
        where: { projectId_relationId: { projectId: p.projectId, relationId: p.relationId } },
        create: { projectId: p.projectId, relationId: p.relationId, sourceHandle: p.sourceHandle, targetHandle: p.targetHandle },
        update: { sourceHandle: p.sourceHandle, targetHandle: p.targetHandle },
      });
    } catch {}

    this.io.to(p.projectId).emit('edge_anchor', p);
  }

  // ===== Broadcasts invocados desde servicios REST =====
  broadcast(projectId: string, event: string, payload: any) {
    this.io.to(projectId).emit(event, payload);
  }
}
