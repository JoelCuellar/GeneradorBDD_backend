import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DomainModelModule } from './modules/domain-model/domain-model.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DiagramModule } from './modules/diagram/diagram.module';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ProjectsModule,
    DomainModelModule,
    RealtimeModule,
    DiagramModule,
  ],
})
export class AppModule {}
