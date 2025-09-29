// src/realtime/realtime.module.ts
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { WsAuthGuard } from './ws-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  imports: [
    // Usa el mismo secret del REST
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [RealtimeGateway, WsAuthGuard, PrismaService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
