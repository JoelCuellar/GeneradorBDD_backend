/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { CreateProjectUseCase } from '../../application/create-project.usecase';
import { UpdateProjectUseCase } from '../../application/update-project.usecase';
import { ArchiveProjectUseCase } from '../../application/archive-project.usecase';
import { ListProjectsUseCase } from '../../application/list-projects.usecase';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let createProject: CreateProjectUseCase;
  let listProjects: ListProjectsUseCase;
  let updateProject: UpdateProjectUseCase;
  let archiveProject: ArchiveProjectUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: CreateProjectUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateProjectUseCase, useValue: { execute: jest.fn() } },
        { provide: ArchiveProjectUseCase, useValue: { execute: jest.fn() } },
        { provide: ListProjectsUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    createProject = module.get<CreateProjectUseCase>(CreateProjectUseCase);
    listProjects = module.get<ListProjectsUseCase>(ListProjectsUseCase);
    updateProject = module.get<UpdateProjectUseCase>(UpdateProjectUseCase);
    archiveProject = module.get<ArchiveProjectUseCase>(ArchiveProjectUseCase);
  });

  it('delegates la creacion de proyectos al caso de uso', async () => {
    const dto = {
      ownerId: 'owner-1',
      name: 'Proyecto',
    } as Parameters<ProjectsController['create']>[0];

    (createProject.execute as jest.Mock).mockResolvedValue('created');

    const result = await controller.create(dto);

    expect(createProject.execute).toHaveBeenCalledWith({
      ownerId: 'owner-1',
      name: 'Proyecto',
      description: null,
    });
    expect(result).toBe('created');
  });

  it('pasa los parametros correctos al listar proyectos', async () => {
    const query = {
      ownerId: 'owner-1',
      includeArchived: true,
    } as Parameters<ProjectsController['list']>[0];

    (listProjects.execute as jest.Mock).mockResolvedValue([]);

    await controller.list(query);

    expect(listProjects.execute).toHaveBeenCalledWith({
      ownerId: 'owner-1',
      includeArchived: true,
    });
  });

  it('actualiza un proyecto mediante el caso de uso', async () => {
    const body = {
      ownerId: 'owner-1',
      name: 'Nuevo',
    } as Parameters<ProjectsController['update']>[1];

    (updateProject.execute as jest.Mock).mockResolvedValue('updated');

    const result = await controller.update('project-1', body);

    expect(updateProject.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      ownerId: 'owner-1',
      name: 'Nuevo',
    });
    expect(result).toBe('updated');
  });

  it('archiva un proyecto mediante el caso de uso', async () => {
    const body = { ownerId: 'owner-1' } as Parameters<ProjectsController['archive']>[1];

    (archiveProject.execute as jest.Mock).mockResolvedValue('archived');

    const result = await controller.archive('project-1', body);

    expect(archiveProject.execute).toHaveBeenCalledWith({
      projectId: 'project-1',
      ownerId: 'owner-1',
    });
    expect(result).toBe('archived');
  });
});
