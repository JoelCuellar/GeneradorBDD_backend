import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DomainModelModule } from './modules/domain-model/domain-model.module';

@Module({
  imports: [PrismaModule, UsersModule, ProjectsModule, DomainModelModule],
})
export class AppModule {}
