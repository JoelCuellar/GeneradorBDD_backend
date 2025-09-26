import {
  AccionGestionProyecto,
  Prisma,
  Proyecto as PrismaProyecto,
  ProyectoAuditoria as PrismaProyectoAuditoria,
  RolProyecto,
} from '@prisma/client';
import {
  ArchiveProjectInput,
  CreateProjectInput,
  ListProjectsParams,
 ProjectRepository,
  UpdateProjectInput,
} from '../domain/project.repository';
import {
  Project,
  ProjectAuditAction,
  ProjectAuditRecord,
} from '../domain/project.entity';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

const mapProject = (project: PrismaProyecto): Project =>
  new Project(
    project.id,
    project.propietarioId,
    project.nombre,
    project.descripcion ?? null,
    project.fechaCreacion,
    project.fechaActualizacion,
    project.archivado,
    project.archivadoEn ?? null,
  );

const mapAudit = (
  audit: PrismaProyectoAuditoria & { actor?: { id: string; nombre: string } | null },
): ProjectAuditRecord => ({
  id: audit.id,
  action: audit.accion as ProjectAuditAction,
  actorId: audit.actorId ?? null,
  actorName: audit.actor?.nombre ?? null,
  detail: (audit.detalle as Record<string, unknown> | null) ?? null,
  createdAt: audit.creadoEn,
});

const toAccion = (action: ProjectAuditAction): AccionGestionProyecto =>
  action as AccionGestionProyecto;

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureOwnerExists(ownerId: string): Promise<void> {
    const owner = await this.prisma.usuario.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Propietario no encontrado');
    }
  }

  async listByOwner(params: ListProjectsParams): Promise<Project[]> {
    const projects = await this.prisma.proyecto.findMany({
      where: {
        propietarioId: params.ownerId,
        ...(params.includeArchived === true
          ? {}
          : params.includeArchived === false
            ? { archivado: false }
            : {}),
      },
      orderBy: [{ fechaCreacion: 'desc' }],
    });

    return projects.map((project) => mapProject(project));
  }

  async findOwnedById(projectId: string, ownerId: string): Promise<Project | null> {
    const project = await this.prisma.proyecto.findFirst({
      where: { id: projectId, propietarioId: ownerId },
    });
    return project ? mapProject(project) : null;
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.prisma.proyecto.findUnique({ where: { nombre: name } });
    return project ? mapProject(project) : null;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    try {
      const project = await this.prisma.$transaction(async (tx) => {
        const created = await tx.proyecto.create({
          data: {
            nombre: input.name,
            descripcion: input.description,
            propietarioId: input.ownerId,
          },
        });

        await tx.proyectoUsuario.create({
          data: {
            proyectoId: created.id,
            usuarioId: input.ownerId,
            rol: RolProyecto.PROPIETARIO,
            activo: true,
          },
        });

        await tx.proyectoAuditoria.create({
          data: {
            proyectoId: created.id,
            actorId: input.ownerId,
            accion: AccionGestionProyecto.CREACION,
          },
        });

        return created;
      });

      return mapProject(project);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El nombre del proyecto ya está en uso');
      }
      throw error;
    }
  }

  async update(input: UpdateProjectInput): Promise<Project> {
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const project = await tx.proyecto.update({
          where: { id: input.projectId },
          data: {
            nombre: input.name,
            descripcion: input.description,
          },
        });

        await tx.proyectoAuditoria.create({
          data: {
            proyectoId: input.projectId,
            actorId: input.ownerId,
            accion: AccionGestionProyecto.ACTUALIZACION,
            detalle: {
              nombre: input.name,
              descripcion: input.description,
            },
          },
        });

        return project;
      });

      return mapProject(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El nombre del proyecto ya está en uso');
      }
      throw error;
    }
  }

  async archive(input: ArchiveProjectInput): Promise<Project> {
    const now = new Date();

    const project = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.proyecto.update({
        where: { id: input.projectId },
        data: {
          archivado: true,
          archivadoEn: now,
        },
      });

      await tx.proyectoAuditoria.create({
        data: {
          proyectoId: input.projectId,
          actorId: input.ownerId,
          accion: AccionGestionProyecto.ARCHIVADO,
        },
      });

      return updated;
    });

    return mapProject(project);
  }

  async getAuditLog(projectId: string, ownerId: string): Promise<ProjectAuditRecord[]> {
    const belongs = await this.prisma.proyecto.findFirst({
      where: { id: projectId, propietarioId: ownerId },
      select: { id: true },
    });
    if (!belongs) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const audits = await this.prisma.proyectoAuditoria.findMany({
      where: { proyectoId: projectId },
      include: {
        actor: { select: { id: true, nombre: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return audits.map((audit) => mapAudit(audit));
  }

  async recordAudit(
    projectId: string,
    action: ProjectAuditAction,
    actorId: string,
    detail?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.proyectoAuditoria.create({
      data: {
        proyectoId: projectId,
        actorId,
        accion: toAccion(action),
        detalle:
          detail === undefined
            ? undefined
            : detail === null
              ? Prisma.JsonNull
              : (detail as Prisma.InputJsonValue),
      },
    });
  }
}
