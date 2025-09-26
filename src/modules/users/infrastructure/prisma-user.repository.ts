import {
  AccionGestionUsuario,
  EstadoUsuario,
  Prisma,
  ProyectoUsuario as PrismaProyectoUsuario,
  RolProyecto,
  Usuario as PrismaUsuario,
  UsuarioAuditoria as PrismaUsuarioAuditoria,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  AssignProjectRoleInput,
  AuditLogInput,
  ChangeUserStatusInput,
  ListUsersParams,
  SoftDeleteUserInput,
  UpdateUserInput,
  UserDetails,
  UserListItem,
  UserRepository,
} from '../domain/user.repository';
import {
  ProjectMembershipSnapshot,
  ProjectRole,
  User,
  UserAuditAction,
  UserAuditRecord,
  UserStatus,
} from '../domain/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

const mapUsuarioToDomain = (usuario: PrismaUsuario): User =>
  new User(
    usuario.id,
    usuario.email,
    usuario.nombre,
    usuario.estado as UserStatus,
    usuario.fechaCreacion,
    usuario.fechaActualizacion,
    usuario.suspendidoEn,
    usuario.eliminadoEn,
  );

const mapMembershipToSnapshot = (
  membership: PrismaProyectoUsuario & {
    proyecto: { id: string; nombre: string };
  },
): ProjectMembershipSnapshot => ({
  projectId: membership.proyectoId,
  projectName: membership.proyecto.nombre,
  role: membership.rol as ProjectRole,
  active: membership.activo,
  assignedAt: membership.fechaAsignacion,
});

const mapAuditRecord = (
  record: PrismaUsuarioAuditoria & { actor?: PrismaUsuario | null },
): UserAuditRecord => ({
  id: record.id,
  action: record.accion as UserAuditAction,
  actorId: record.actorId ?? null,
  actorName: record.actor ? record.actor.nombre : null,
  detail: (record.detalle as Record<string, unknown> | null) ?? null,
  createdAt: record.creadoEn,
});

const toEstado = (status: UserStatus): EstadoUsuario => status as EstadoUsuario;
const toAccion = (action: UserAuditAction): AccionGestionUsuario =>
  action as AccionGestionUsuario;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario ? mapUsuarioToDomain(usuario) : null;
  }

  async findDetailsById(id: string): Promise<UserDetails | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        membresias: {
          include: { proyecto: { select: { id: true, nombre: true } } },
          orderBy: { fechaAsignacion: 'desc' },
        },
      },
    });

    if (!usuario) return null;

    const memberships = usuario.membresias.map((m) =>
      mapMembershipToSnapshot(m),
    );

    return {
      user: mapUsuarioToDomain(usuario),
      memberships,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    return usuario ? mapUsuarioToDomain(usuario) : null;
  }

  async create(user: User, actorId: string): Promise<User> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const nuevo = await tx.usuario.create({
          data: {
            id: user.id,
            email: user.email,
            nombre: user.name,
            fechaCreacion: user.createdAt,
            estado: toEstado(user.status),
            activo: user.status === UserStatus.ACTIVO,
          },
        });

        await tx.usuarioAuditoria.create({
          data: {
            usuarioId: nuevo.id,
            actorId,
            accion: AccionGestionUsuario.CREACION,
          },
        });

        return nuevo;
      });

      return mapUsuarioToDomain(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El correo ya está registrado');
      }
      throw error;
    }
  }

  async update(input: UpdateUserInput): Promise<User> {
    try {
      const usuario = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.usuario.update({
          where: { id: input.id },
          data: { nombre: input.name, email: input.email },
        });

        await tx.usuarioAuditoria.create({
          data: {
            usuarioId: input.id,
            actorId: input.actorId,
            accion: AccionGestionUsuario.ACTUALIZACION_DATOS,
            detalle: { nombre: input.name, email: input.email },
          },
        });

        return updated;
      });

      return mapUsuarioToDomain(usuario);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El correo ya está registrado');
      }
      throw error;
    }
  }

  async list(params: ListUsersParams): Promise<UserListItem[]> {
    await this.ensureActorCanManageProject(params.actorId, params.projectId);

    const where: Prisma.UsuarioWhereInput = {
      membresias: { some: { proyectoId: params.projectId } },
    };

    if (params.filters?.status) {
      where.estado = toEstado(params.filters.status);
    }
    if (params.filters?.name) {
      where.nombre = {
        contains: params.filters.name,
        mode: 'insensitive',
      };
    }
    if (params.filters?.email) {
      where.email = {
        contains: params.filters.email,
        mode: 'insensitive',
      };
    }
    if (params.filters?.role) {
      where.membresias = {
        some: {
          proyectoId: params.projectId,
          rol: params.filters.role as RolProyecto,
        },
      };
    }

    const usuarios = await this.prisma.usuario.findMany({
      where,
      include: {
        membresias: {
          where: { proyectoId: params.projectId },
          include: { proyecto: { select: { id: true, nombre: true } } },
          orderBy: { fechaAsignacion: 'desc' },
        },
      },
      orderBy: [{ nombre: 'asc' }],
    });

    return usuarios.map((usuario) => ({
      user: mapUsuarioToDomain(usuario),
      memberships: usuario.membresias.map((m) => mapMembershipToSnapshot(m)),
    }));
  }

  async assignProjectRole(
    input: AssignProjectRoleInput,
  ): Promise<ProjectMembershipSnapshot> {
    await this.ensureActorCanManageProject(input.actorId, input.projectId);

    const membership = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({
        where: { id: input.userId },
      });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const existente = await tx.proyectoUsuario.findUnique({
        where: {
          proyectoId_usuarioId: {
            proyectoId: input.projectId,
            usuarioId: input.userId,
          },
        },
        include: { proyecto: { select: { id: true, nombre: true } } },
      });

      if (
        existente &&
        existente.rol === RolProyecto.PROPIETARIO &&
        input.role !== 'PROPIETARIO'
      ) {
        const otros = await tx.proyectoUsuario.count({
          where: {
            proyectoId: input.projectId,
            rol: RolProyecto.PROPIETARIO,
            activo: true,
            NOT: { usuarioId: input.userId },
          },
        });
        if (otros === 0) {
          throw new BadRequestException(
            'No se puede quitar el último propietario del proyecto',
          );
        }
      }

      const asignacion = existente
        ? await tx.proyectoUsuario.update({
            where: { id: existente.id },
            data: {
              rol: input.role as RolProyecto,
              activo: true,
              fechaAsignacion: new Date(),
            },
            include: { proyecto: { select: { id: true, nombre: true } } },
          })
        : await tx.proyectoUsuario.create({
            data: {
              proyectoId: input.projectId,
              usuarioId: input.userId,
              rol: input.role as RolProyecto,
            },
            include: { proyecto: { select: { id: true, nombre: true } } },
          });

      await tx.usuarioAuditoria.create({
        data: {
          usuarioId: input.userId,
          actorId: input.actorId,
          accion: AccionGestionUsuario.CAMBIO_ROL,
          detalle: {
            proyectoId: input.projectId,
            rol: input.role,
          },
        },
      });

      return asignacion;
    });

    return mapMembershipToSnapshot(membership);
  }

  async changeStatus(input: ChangeUserStatusInput): Promise<User> {
    const target = await this.prisma.usuario.findUnique({
      where: { id: input.userId },
    });
    if (!target) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (input.status === UserStatus.SUSPENDIDO) {
      const blocking = await this.validateNotLastOwner(input.userId);
      if (blocking.length > 0) {
        throw new BadRequestException(
          `No se puede suspender al último propietario en: ${blocking.join(', ')}`,
        );
      }
    }

    const action =
      input.status === UserStatus.ACTIVO
        ? AccionGestionUsuario.ACTIVACION
        : AccionGestionUsuario.SUSPENSION;
    const now = new Date();

    const usuario = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.usuario.update({
        where: { id: input.userId },
        data: {
          estado: toEstado(input.status),
          activo: input.status === UserStatus.ACTIVO,
          suspendidoEn:
            input.status === UserStatus.SUSPENDIDO ? now : null,
          eliminadoEn:
            input.status === UserStatus.ACTIVO ? null : target.eliminadoEn,
        },
      });

      await tx.usuarioAuditoria.create({
        data: {
          usuarioId: input.userId,
          actorId: input.actorId,
          accion: action,
          detalle: input.reason ? { motivo: input.reason } : undefined,
        },
      });

      if (input.status === UserStatus.ACTIVO) {
        await tx.proyectoUsuario.updateMany({
          where: { usuarioId: input.userId },
          data: { activo: true },
        });
      } else {
        await tx.proyectoUsuario.updateMany({
          where: { usuarioId: input.userId },
          data: { activo: false },
        });
      }

      return updated;
    });

    return mapUsuarioToDomain(usuario);
  }

  async softDelete(input: SoftDeleteUserInput): Promise<User> {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: input.userId },
    });
    if (!usuarioActual) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const blocking = await this.validateNotLastOwner(input.userId);
    if (blocking.length > 0) {
      throw new BadRequestException(
        `No se puede desactivar al último propietario en: ${blocking.join(', ')}`,
      );
    }

    const now = new Date();

    const usuario = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.usuario.update({
        where: { id: input.userId },
        data: {
          estado: EstadoUsuario.ELIMINADO,
          activo: false,
          eliminadoEn: now,
          suspendidoEn: null,
        },
      });

      await tx.proyectoUsuario.updateMany({
        where: { usuarioId: input.userId },
        data: { activo: false },
      });

      await tx.usuarioAuditoria.create({
        data: {
          usuarioId: input.userId,
          actorId: input.actorId,
          accion: AccionGestionUsuario.BAJA_LOGICA,
          detalle: input.reason ? { motivo: input.reason } : undefined,
        },
      });

      return updated;
    });

    return mapUsuarioToDomain(usuario);
  }

  async getAuditLog(userId: string): Promise<UserAuditRecord[]> {
    const registros = await this.prisma.usuarioAuditoria.findMany({
      where: { usuarioId: userId },
      include: {
        actor: true,
      },
      orderBy: { creadoEn: 'desc' },
    });

    return registros.map((registro) => mapAuditRecord(registro));
  }

  async recordAudit(entry: AuditLogInput): Promise<void> {
    await this.prisma.usuarioAuditoria.create({
      data: {
        usuarioId: entry.userId,
        actorId: entry.actorId ?? null,
        accion: toAccion(entry.action),
        detalle:
          entry.detail === undefined
            ? undefined
            : entry.detail === null
              ? Prisma.JsonNull
              : (entry.detail as Prisma.InputJsonValue),
      },
    });
  }

  async ensureActorCanManageProject(
    actorId: string,
    projectId: string,
  ): Promise<void> {
    const membership = await this.prisma.proyectoUsuario.findUnique({
      where: {
        proyectoId_usuarioId: {
          proyectoId: projectId,
          usuarioId: actorId,
        },
      },
    });

    if (!membership || membership.rol !== RolProyecto.PROPIETARIO || !membership.activo) {
      throw new ForbiddenException(
        'El usuario autenticado no es propietario de este proyecto',
      );
    }
  }

  async validateNotLastOwner(userId: string): Promise<string[]> {
    const memberships = await this.prisma.proyectoUsuario.findMany({
      where: {
        usuarioId: userId,
        rol: RolProyecto.PROPIETARIO,
        activo: true,
        proyecto: { archivado: false },
      },
      select: {
        proyectoId: true,
        proyecto: {
          select: {
            id: true,
            nombre: true,
            membresias: {
              where: { rol: RolProyecto.PROPIETARIO, activo: true },
              select: { usuarioId: true },
            },
          },
        },
      },
    });

    const directOwnership = await this.prisma.proyecto.findMany({
      where: { propietarioId: userId, archivado: false },
      select: {
        id: true,
        nombre: true,
        membresias: {
          where: { rol: RolProyecto.PROPIETARIO, activo: true },
          select: { usuarioId: true },
        },
      },
    });

    const blocking = new Set<string>();

    memberships.forEach((m) => {
      const others = m.proyecto.membresias.filter(
        (owner) => owner.usuarioId !== userId,
      );
      if (others.length === 0) {
        blocking.add(m.proyecto.nombre);
      }
    });

    directOwnership.forEach((project) => {
      const others = project.membresias.filter(
        (owner) => owner.usuarioId !== userId,
      );
      if (others.length === 0) {
        blocking.add(project.nombre);
      }
    });

    return [...blocking];
  }
}
