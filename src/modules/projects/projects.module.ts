import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { ProjectsController } from './interface/http/projects.controller';
import { CreateProjectUseCase } from './application/create-project.usecase';
import { UpdateProjectUseCase } from './application/update-project.usecase';
import { ArchiveProjectUseCase } from './application/archive-project.usecase';
import { ListProjectsUseCase } from './application/list-projects.usecase';
import { PROJECT_REPOSITORY } from './domain/project.repository';
import { PrismaProjectRepository } from './infrastructure/prisma-project.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [
    CreateProjectUseCase,
    UpdateProjectUseCase,
    ArchiveProjectUseCase,
    ListProjectsUseCase,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
  ],
})
export class ProjectsModule {}
