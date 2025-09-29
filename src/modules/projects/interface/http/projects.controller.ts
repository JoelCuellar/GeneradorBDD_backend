import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProjectUseCase } from '../../application/create-project.usecase';
import {
  UpdateProjectUseCase,
  UpdateProjectCommand,
} from '../../application/update-project.usecase';
import { ArchiveProjectUseCase } from '../../application/archive-project.usecase';
import { ListProjectsUseCase } from '../../application/list-projects.usecase';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

class OwnerDto {
  @IsUUID()
  ownerId!: string;
}

class CreateProjectDto extends OwnerDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

class ListProjectsQueryDto extends OwnerDto {
  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;
}

class UpdateProjectDto extends OwnerDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly updateProject: UpdateProjectUseCase,
    private readonly archiveProject: ArchiveProjectUseCase,
    private readonly listProjects: ListProjectsUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.createProject.execute({
      ownerId: dto.ownerId,
      name: dto.name,
      description: dto.description ?? null,
    });
  }

  @Get()
  list(@Query() query: ListProjectsQueryDto) {
    return this.listProjects.execute({
      ownerId: query.ownerId,
      includeArchived: query.includeArchived,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const payload: UpdateProjectCommand = {
      projectId: id,
      ownerId: dto.ownerId,
    };

    if (dto.name !== undefined) {
      payload.name = dto.name;
    }
    if (dto.description !== undefined) {
      payload.description = dto.description;
    }

    return this.updateProject.execute(payload);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Body() dto: OwnerDto) {
    return this.archiveProject.execute({
      projectId: id,
      ownerId: dto.ownerId,
    });
  }
}
