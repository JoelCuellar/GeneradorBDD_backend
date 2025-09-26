import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccionModeloDominio,
  DominioAtributo as PrismaDominioAtributo,
  DominioClase as PrismaDominioClase,
  DominioIdentidad as PrismaDominioIdentidad,
  DominioRelacion as PrismaDominioRelacion,
  MultiplicidadRelacion,
  Prisma,
  RolProyecto,
  TipoAtributoDominio,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  CreateAttributeInput,
  CreateClassInput,
  CreateRelationInput,
  DeleteAttributeInput,
  DeleteClassInput,
  DeleteRelationInput,
  DefineIdentityInput,
  DomainModelRepository,
  RemoveIdentityInput,
  UpdateAttributeInput,
  UpdateClassInput,
  UpdateRelationInput,
} from '../domain/domain-model.repository';
import {
  DomainAuditAction,
  DomainAttribute,
  DomainAttributeType,
  DomainClass,
  DomainIdentity,
  DomainModelSnapshot,
  DomainMultiplicity,
  DomainRelation,
} from '../domain/domain-model.entity';
const attributeTypeMap: Record<TipoAtributoDominio, DomainAttributeType> = {
  [TipoAtributoDominio.STRING]: DomainAttributeType.STRING,
  [TipoAtributoDominio.ENTERO]: DomainAttributeType.ENTERO,
  [TipoAtributoDominio.DECIMAL]: DomainAttributeType.DECIMAL,
  [TipoAtributoDominio.BOOLEANO]: DomainAttributeType.BOOLEANO,
  [TipoAtributoDominio.FECHA]: DomainAttributeType.FECHA,
  [TipoAtributoDominio.FECHA_HORA]: DomainAttributeType.FECHA_HORA,
  [TipoAtributoDominio.UUID]: DomainAttributeType.UUID,
  [TipoAtributoDominio.TEXTO]: DomainAttributeType.TEXTO,
};

const reverseAttributeTypeMap: Record<
  DomainAttributeType,
  TipoAtributoDominio
> = {
  [DomainAttributeType.STRING]: TipoAtributoDominio.STRING,
  [DomainAttributeType.ENTERO]: TipoAtributoDominio.ENTERO,
  [DomainAttributeType.DECIMAL]: TipoAtributoDominio.DECIMAL,
  [DomainAttributeType.BOOLEANO]: TipoAtributoDominio.BOOLEANO,
  [DomainAttributeType.FECHA]: TipoAtributoDominio.FECHA,
  [DomainAttributeType.FECHA_HORA]: TipoAtributoDominio.FECHA_HORA,
  [DomainAttributeType.UUID]: TipoAtributoDominio.UUID,
  [DomainAttributeType.TEXTO]: TipoAtributoDominio.TEXTO,
};

const multiplicityMap: Record<MultiplicidadRelacion, DomainMultiplicity> = {
  [MultiplicidadRelacion.UNO]: DomainMultiplicity.UNO,
  [MultiplicidadRelacion.CERO_O_UNO]: DomainMultiplicity.CERO_O_UNO,
  [MultiplicidadRelacion.UNO_O_MAS]: DomainMultiplicity.UNO_O_MAS,
  [MultiplicidadRelacion.CERO_O_MAS]: DomainMultiplicity.CERO_O_MAS,
};

const reverseMultiplicityMap: Record<
  DomainMultiplicity,
  MultiplicidadRelacion
> = {
  [DomainMultiplicity.UNO]: MultiplicidadRelacion.UNO,
  [DomainMultiplicity.CERO_O_UNO]: MultiplicidadRelacion.CERO_O_UNO,
  [DomainMultiplicity.UNO_O_MAS]: MultiplicidadRelacion.UNO_O_MAS,
  [DomainMultiplicity.CERO_O_MAS]: MultiplicidadRelacion.CERO_O_MAS,
};
function toPrismaJson(
  v: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (v === undefined) return undefined;
  if (v === null) return Prisma.JsonNull;
  return v as Prisma.InputJsonValue;
}
const auditActionMap: Record<DomainAuditAction, AccionModeloDominio> = {
  [DomainAuditAction.CLASE_CREADA]: AccionModeloDominio.CLASE_CREADA,
  [DomainAuditAction.CLASE_ACTUALIZADA]: AccionModeloDominio.CLASE_ACTUALIZADA,
  [DomainAuditAction.CLASE_ELIMINADA]: AccionModeloDominio.CLASE_ELIMINADA,
  [DomainAuditAction.ATRIBUTO_CREADO]: AccionModeloDominio.ATRIBUTO_CREADO,
  [DomainAuditAction.ATRIBUTO_ACTUALIZADO]: AccionModeloDominio.ATRIBUTO_ACTUALIZADO,
  [DomainAuditAction.ATRIBUTO_ELIMINADO]: AccionModeloDominio.ATRIBUTO_ELIMINADO,
  [DomainAuditAction.RELACION_CREADA]: AccionModeloDominio.RELACION_CREADA,
  [DomainAuditAction.RELACION_ACTUALIZADA]: AccionModeloDominio.RELACION_ACTUALIZADA,
  [DomainAuditAction.RELACION_ELIMINADA]: AccionModeloDominio.RELACION_ELIMINADA,
  [DomainAuditAction.IDENTIDAD_DEFINIDA]: AccionModeloDominio.IDENTIDAD_DEFINIDA,
  [DomainAuditAction.IDENTIDAD_ELIMINADA]: AccionModeloDominio.IDENTIDAD_ELIMINADA,
};

const mapAttribute = (attribute: PrismaDominioAtributo): DomainAttribute => ({
  id: attribute.id,
  classId: attribute.claseId,
  name: attribute.nombre,
  type: attributeTypeMap[attribute.tipo],
  required: attribute.obligatorio,
  config: (attribute.configuracion as Record<string, unknown> | null) ?? null,
  createdAt: attribute.creadoEn,
  updatedAt: attribute.actualizadoEn,
});

const mapIdentity = (
  identity: PrismaDominioIdentidad & { atributos: { atributoId: string; orden: number }[] },
): DomainIdentity => ({
  id: identity.id,
  classId: identity.claseId,
  name: identity.nombre,
  description: identity.descripcion ?? null,
  attributeIds: identity.atributos
    .sort((a, b) => a.orden - b.orden)
    .map((item) => item.atributoId),
  createdAt: identity.creadoEn,
  updatedAt: identity.actualizadoEn,
});

const mapClass = (
  clazz: PrismaDominioClase & {
    atributos: PrismaDominioAtributo[];
    identidades: (PrismaDominioIdentidad & {
      atributos: { atributoId: string; orden: number }[];
    })[];
  },
): DomainClass => ({
  id: clazz.id,
  projectId: clazz.proyectoId,
  name: clazz.nombre,
  description: clazz.descripcion ?? null,
  attributes: clazz.atributos.map(mapAttribute),
  identities: clazz.identidades.map(mapIdentity),
  createdAt: clazz.creadoEn,
  updatedAt: clazz.actualizadoEn,
});

const mapRelation = (relation: PrismaDominioRelacion): DomainRelation => ({
  id: relation.id,
  projectId: relation.proyectoId,
  name: relation.nombre ?? null,
  sourceClassId: relation.origenId,
  targetClassId: relation.destinoId,
  sourceRole: relation.rolOrigen ?? null,
  targetRole: relation.rolDestino ?? null,
  sourceMultiplicity: multiplicityMap[relation.multiplicidadOrigen],
  targetMultiplicity: multiplicityMap[relation.multiplicidadDestino],
  createdAt: relation.creadoEn,
  updatedAt: relation.actualizadoEn,
});

@Injectable()
export class PrismaDomainModelRepository implements DomainModelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureViewerAccess(projectId: string, actorId: string): Promise<void> {
    const membership = await this.prisma.proyectoUsuario.findFirst({
      where: { proyectoId: projectId, usuarioId: actorId, activo: true },
      select: { id: true },
    });
    if (membership) return;

    const project = await this.prisma.proyecto.findFirst({
      where: { id: projectId, propietarioId: actorId },
      select: { id: true },
    });
    if (!project) {
      throw new ForbiddenException('El usuario no posee permisos para visualizar el proyecto');
    }
  }

  async ensureEditorAccess(projectId: string, actorId: string) {
    const membership = await this.prisma.proyectoUsuario.findFirst({
      where: {
        proyectoId: projectId,
        usuarioId: actorId,
        activo: true,
        rol: { in: [RolProyecto.PROPIETARIO, RolProyecto.EDITOR] },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException(
        'El usuario no posee permisos de edicion en el proyecto',
      );
    }

    return { actorId, membershipId: membership.id };
  }

  async getModel(projectId: string): Promise<DomainModelSnapshot> {
    const [classes, relations] = await Promise.all([
      this.prisma.dominioClase.findMany({
        where: { proyectoId: projectId },
        include: {
          atributos: true,
          identidades: { include: { atributos: true } },
        },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.dominioRelacion.findMany({
        where: { proyectoId: projectId },
        orderBy: { creadoEn: 'asc' },
      }),
    ]);

    return {
      classes: classes.map(mapClass),
      relations: relations.map(mapRelation),
    };
  }

  async findClassById(
    projectId: string,
    classId: string,
  ): Promise<DomainClass | null> {
    const clazz = await this.prisma.dominioClase.findFirst({
      where: { id: classId, proyectoId: projectId },
      include: {
        atributos: true,
        identidades: { include: { atributos: true } },
      },
    });
    return clazz ? mapClass(clazz) : null;
  }

  async findClassByName(
    projectId: string,
    name: string,
  ): Promise<DomainClass | null> {
    const clazz = await this.prisma.dominioClase.findFirst({
      where: { proyectoId: projectId, nombre: name },
      include: {
        atributos: true,
        identidades: { include: { atributos: true } },
      },
    });
    return clazz ? mapClass(clazz) : null;
  }

  async createClass(input: CreateClassInput): Promise<DomainClass> {
    const exists = await this.prisma.dominioClase.findFirst({
      where: { proyectoId: input.projectId, nombre: input.name },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException('Ya existe una clase con ese nombre');
    }

    const created = await this.prisma.dominioClase.create({
      data: {
        proyectoId: input.projectId,
        nombre: input.name,
        descripcion: input.description,
      },
      include: {
        atributos: true,
        identidades: { include: { atributos: true } },
      },
    });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.CLASE_CREADA,
      {
        classId: created.id,
        name: created.nombre,
      },
    );

    return mapClass(created);
  }

  async updateClass(input: UpdateClassInput): Promise<DomainClass> {
    const clazz = await this.prisma.dominioClase.findFirst({
      where: { id: input.classId, proyectoId: input.projectId },
    });
    if (!clazz) {
      throw new NotFoundException('Clase no encontrada');
    }

    const data: Prisma.DominioClaseUpdateInput = {};
    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed) {
        throw new BadRequestException('El nombre de la clase es obligatorio');
      }
      const duplicated = await this.prisma.dominioClase.findFirst({
        where: {
          proyectoId: input.projectId,
          nombre: trimmed,
          NOT: { id: input.classId },
        },
        select: { id: true },
      });
      if (duplicated) {
        throw new BadRequestException('Ya existe una clase con ese nombre');
      }
      data.nombre = trimmed;
    }
    if (input.description !== undefined) {
      const trimmed = input.description?.trim();
      data.descripcion = trimmed && trimmed.length > 0 ? trimmed : null;
    }

    if (Object.keys(data).length === 0) {
      return (await this.findClassById(input.projectId, input.classId))!;
    }

    const updated = await this.prisma.dominioClase.update({
      where: { id: input.classId },
      data,
      include: {
        atributos: true,
        identidades: { include: { atributos: true } },
      },
    });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.CLASE_ACTUALIZADA,
      {
        classId: updated.id,
        name: updated.nombre,
      },
    );

    return mapClass(updated);
  }

  async deleteClass(input: DeleteClassInput): Promise<void> {
    const clazz = await this.prisma.dominioClase.findFirst({
      where: { id: input.classId, proyectoId: input.projectId },
    });
    if (!clazz) throw new NotFoundException('Clase no encontrada');

    const relationCount = await this.prisma.dominioRelacion.count({
      where: {
        OR: [{ origenId: input.classId }, { destinoId: input.classId }],
      },
    });
    if (relationCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la clase mientras tenga relaciones activas',
      );
    }

    await this.prisma.dominioClase.delete({ where: { id: input.classId } });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.CLASE_ELIMINADA,
      {
        classId: input.classId,
      },
    );
  }

  async createAttribute(input: CreateAttributeInput): Promise<DomainAttribute> {
    this.assertValidAttributeType(input.type);

    const clazz = await this.prisma.dominioClase.findFirst({
      where: { id: input.classId, proyectoId: input.projectId },
    });
    if (!clazz) throw new NotFoundException('Clase no encontrada');

    const duplicated = await this.prisma.dominioAtributo.findFirst({
      where: { claseId: input.classId, nombre: input.name },
      select: { id: true },
    });
    if (duplicated) {
      throw new BadRequestException(
        'Ya existe un atributo con ese nombre en la clase',
      );
    }

    const created = await this.prisma.dominioAtributo.create({
      data: {
        claseId: input.classId,
        nombre: input.name,
        tipo: reverseAttributeTypeMap[input.type],
        obligatorio: input.required,
        configuracion: toPrismaJson(input.config),
      },
    });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.ATRIBUTO_CREADO,
      {
        classId: input.classId,
        attributeId: created.id,
        name: created.nombre,
      },
    );

    return mapAttribute(created);
  }

  async updateAttribute(input: UpdateAttributeInput): Promise<DomainAttribute> {
    const attribute = await this.prisma.dominioAtributo.findFirst({
      where: {
        id: input.attributeId,
        clase: { proyectoId: input.projectId },
      },
      include: { clase: true },
    });
    if (!attribute) {
      throw new NotFoundException('Atributo no encontrado');
    }

    const data: Prisma.DominioAtributoUpdateInput = {};
    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed) {
        throw new BadRequestException('El nombre del atributo es obligatorio');
      }
      const duplicated = await this.prisma.dominioAtributo.findFirst({
        where: {
          claseId: attribute.claseId,
          nombre: trimmed,
          NOT: { id: input.attributeId },
        },
        select: { id: true },
      });
      if (duplicated) {
        throw new BadRequestException(
          'Ya existe un atributo con ese nombre en la clase',
        );
      }
      data.nombre = trimmed;
    }
    if (input.type !== undefined) {
      this.assertValidAttributeType(input.type);
      data.tipo = reverseAttributeTypeMap[input.type];
    }
    if (input.required !== undefined) {
      data.obligatorio = input.required;
    }
    if (input.config !== undefined) {
      data.configuracion = toPrismaJson(input.config);
    }

    if (Object.keys(data).length === 0) {
      return mapAttribute(attribute);
    }

    const updated = await this.prisma.dominioAtributo.update({
      where: { id: input.attributeId },
      data,
    });

    await this.recordAudit(
      attribute.clase.proyectoId,
      input.actorId,
      DomainAuditAction.ATRIBUTO_ACTUALIZADO,
      {
        classId: attribute.claseId,
        attributeId: updated.id,
      },
    );

    return mapAttribute(updated);
  }

  async deleteAttribute(input: DeleteAttributeInput): Promise<void> {
    const attribute = await this.prisma.dominioAtributo.findFirst({
      where: {
        id: input.attributeId,
        clase: { proyectoId: input.projectId },
      },
      include: { clase: true },
    });
    if (!attribute) throw new NotFoundException('Atributo no encontrado');

    const identityUsage = await this.prisma.dominioIdentidadAtributo.count({
      where: { atributoId: input.attributeId },
    });
    if (identityUsage > 0) {
      throw new BadRequestException(
        'No se puede eliminar el atributo porque participa en una identidad',
      );
    }

    await this.prisma.dominioAtributo.delete({ where: { id: input.attributeId } });

    await this.recordAudit(
      attribute.clase.proyectoId,
      input.actorId,
      DomainAuditAction.ATRIBUTO_ELIMINADO,
      {
        classId: attribute.claseId,
        attributeId: input.attributeId,
      },
    );
  }

  async createRelation(input: CreateRelationInput): Promise<DomainRelation> {
    const source = await this.prisma.dominioClase.findFirst({
      where: { id: input.sourceClassId, proyectoId: input.projectId },
      select: { id: true },
    });
    if (!source) throw new NotFoundException('Clase de origen no encontrada');

    const target = await this.prisma.dominioClase.findFirst({
      where: { id: input.targetClassId, proyectoId: input.projectId },
      select: { id: true },
    });
    if (!target) throw new NotFoundException('Clase de destino no encontrada');

    const sourceMultiplicity = this.ensureMultiplicity(
      input.sourceMultiplicity,
    );
    const targetMultiplicity = this.ensureMultiplicity(
      input.targetMultiplicity,
    );

    const created = await this.prisma.dominioRelacion.create({
      data: {
        proyectoId: input.projectId,
        origenId: input.sourceClassId,
        destinoId: input.targetClassId,
        nombre: input.name ?? undefined,
        rolOrigen: this.normalizeNullable(input.sourceRole),
        rolDestino: this.normalizeNullable(input.targetRole),
        multiplicidadOrigen: reverseMultiplicityMap[sourceMultiplicity],
        multiplicidadDestino: reverseMultiplicityMap[targetMultiplicity],
      },
    });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.RELACION_CREADA,
      {
        relationId: created.id,
        sourceClassId: created.origenId,
        targetClassId: created.destinoId,
      },
    );

    return mapRelation(created);
  }

  async updateRelation(input: UpdateRelationInput): Promise<DomainRelation> {
    const relation = await this.prisma.dominioRelacion.findFirst({
      where: { id: input.relationId, proyectoId: input.projectId },
    });
    if (!relation) throw new NotFoundException('Relacion no encontrada');

    const data: Prisma.DominioRelacionUpdateInput = {};
    if (input.name !== undefined) {
      data.nombre = this.normalizeNullable(input.name);
    }
    if (input.sourceRole !== undefined) {
      data.rolOrigen = this.normalizeNullable(input.sourceRole);
    }
    if (input.targetRole !== undefined) {
      data.rolDestino = this.normalizeNullable(input.targetRole);
    }
    if (input.sourceMultiplicity !== undefined) {
      const mult = this.ensureMultiplicity(input.sourceMultiplicity);
      data.multiplicidadOrigen = reverseMultiplicityMap[mult];
    }
    if (input.targetMultiplicity !== undefined) {
      const mult = this.ensureMultiplicity(input.targetMultiplicity);
      data.multiplicidadDestino = reverseMultiplicityMap[mult];
    }

    if (Object.keys(data).length === 0) {
      return mapRelation(relation);
    }

    const updated = await this.prisma.dominioRelacion.update({
      where: { id: input.relationId },
      data,
    });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.RELACION_ACTUALIZADA,
      {
        relationId: updated.id,
      },
    );

    return mapRelation(updated);
  }

  async deleteRelation(input: DeleteRelationInput): Promise<void> {
    const relation = await this.prisma.dominioRelacion.findFirst({
      where: { id: input.relationId, proyectoId: input.projectId },
    });
    if (!relation) throw new NotFoundException('Relacion no encontrada');

    await this.prisma.dominioRelacion.delete({ where: { id: input.relationId } });

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.RELACION_ELIMINADA,
      {
        relationId: input.relationId,
      },
    );
  }

  async defineIdentity(input: DefineIdentityInput): Promise<DomainIdentity> {
    if (input.attributeIds.length === 0) {
      throw new BadRequestException(
        'Debe seleccionar al menos un atributo para la identidad',
      );
    }

    const clazz = await this.prisma.dominioClase.findFirst({
      where: { id: input.classId, proyectoId: input.projectId },
    });
    if (!clazz) throw new NotFoundException('Clase no encontrada');

    const attributes = await this.prisma.dominioAtributo.findMany({
      where: { id: { in: input.attributeIds }, claseId: input.classId },
      select: { id: true },
    });
    if (attributes.length !== input.attributeIds.length) {
      throw new BadRequestException(
        'Algunos atributos no pertenecen a la clase indicada',
      );
    }

    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new BadRequestException('El nombre de la identidad es obligatorio');
    }

    const existingWithName = await this.prisma.dominioIdentidad.findFirst({
      where: {
        claseId: input.classId,
        nombre: trimmedName,
        ...(input.identityId ? { NOT: { id: input.identityId } } : {}),
      },
      select: { id: true },
    });
    if (existingWithName) {
      throw new BadRequestException(
        'Ya existe una identidad con ese nombre en la clase',
      );
    }

    let result: PrismaDominioIdentidad;
    if (input.identityId) {
      const identity = await this.prisma.dominioIdentidad.findFirst({
        where: { id: input.identityId, claseId: input.classId },
      });
      if (!identity) {
        throw new NotFoundException('Identidad no encontrada');
      }

      result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.dominioIdentidad.update({
          where: { id: input.identityId },
          data: {
            nombre: trimmedName,
            descripcion: this.normalizeNullable(input.description),
          },
        });
        await tx.dominioIdentidadAtributo.deleteMany({ where: { identidadId: input.identityId } });
        await tx.dominioIdentidadAtributo.createMany({
          data: input.attributeIds.map((attributeId, index) => ({
            identidadId: updated.id,
            atributoId: attributeId,
            orden: index,
          })),
        });
        return updated;
      });
    } else {
      result = await this.prisma.$transaction(async (tx) => {
        const created = await tx.dominioIdentidad.create({
          data: {
            claseId: input.classId,
            nombre: trimmedName,
            descripcion: this.normalizeNullable(input.description),
          },
        });
        await tx.dominioIdentidadAtributo.createMany({
          data: input.attributeIds.map((attributeId, index) => ({
            identidadId: created.id,
            atributoId: attributeId,
            orden: index,
          })),
        });
        return created;
      });
    }

    const identityWithAttrs = await this.prisma.dominioIdentidad.findUnique({
      where: { id: result.id },
      include: { atributos: true },
    });
    if (!identityWithAttrs) {
      throw new NotFoundException(
        'No se pudo recuperar la identidad despues de guardarla',
      );
    }

    await this.recordAudit(
      input.projectId,
      input.actorId,
      DomainAuditAction.IDENTIDAD_DEFINIDA,
      {
        classId: input.classId,
        identityId: identityWithAttrs.id,
      },
    );

    return mapIdentity(identityWithAttrs);
  }

  async removeIdentity(input: RemoveIdentityInput): Promise<void> {
    const identity = await this.prisma.dominioIdentidad.findFirst({
      where: {
        id: input.identityId,
        clase: { proyectoId: input.projectId },
      },
      include: { clase: true },
    });
    if (!identity) throw new NotFoundException('Identidad no encontrada');

    await this.prisma.dominioIdentidad.delete({ where: { id: input.identityId } });

    await this.recordAudit(
      identity.clase.proyectoId,
      input.actorId,
      DomainAuditAction.IDENTIDAD_ELIMINADA,
      {
        classId: identity.claseId,
        identityId: input.identityId,
      },
    );
  }

  private assertValidAttributeType(type: DomainAttributeType) {
    if (!(type in reverseAttributeTypeMap)) {
      throw new BadRequestException('Tipo de atributo no soportado');
    }
  }

  private ensureMultiplicity(raw: string): DomainMultiplicity {
    if (!raw) {
      throw new BadRequestException('La multiplicidad es obligatoria');
    }
    const upper = raw.toUpperCase() as DomainMultiplicity;
    if (!(upper in reverseMultiplicityMap)) {
      throw new BadRequestException('Multiplicidad no soportada');
    }
    return upper;
  }

  private normalizeNullable(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }

  private async recordAudit(
    projectId: string,
    actorId: string,
    action: DomainAuditAction,
    detail: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.dominioAuditoria.create({
      data: {
        proyectoId: projectId,
        actorId,
        accion: auditActionMap[action],
        entidad: detail.classId
          ? 'CLASE'
          : detail.relationId
            ? 'RELACION'
            : detail.attributeId
              ? 'ATRIBUTO'
              : 'IDENTIDAD',
        entidadId:
          (detail.classId as string | undefined) ??
          (detail.relationId as string | undefined) ??
          (detail.attributeId as string | undefined) ??
          (detail.identityId as string | undefined) ??
          projectId,
        detalle: detail as any,
      },
    });
  }
}




