import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DomainModelModule } from './modules/domain-model/domain-model.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DiagramModule } from './modules/diagram/diagram.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule.register({
      global: true, // ✅ disponible en todos los módulos
      secret: process.env.JWT_SECRET ?? 'change-me-in-prod',
      signOptions: { expiresIn: '7d' },
    }),
    PrismaModule,
    UsersModule,
    ProjectsModule,
    DomainModelModule,
    RealtimeModule,
    DiagramModule,
    InvitationsModule,
  ],
})
export class AppModule {}
