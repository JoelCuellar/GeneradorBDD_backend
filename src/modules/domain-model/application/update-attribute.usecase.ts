import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DOMAIN_MODEL_REPOSITORY } from '../domain/domain-model.repository';
import {
  DomainAttributeType,
  DomainConstraintConfig,
} from '../domain/domain-model.entity';
import type { DomainModelRepository } from '../domain/domain-model.repository';

export interface UpdateDomainAttributeInput {
  projectId: string;
  actorId: string;
  attributeId: string;
  name?: string;
  type?: string;
  required?: boolean;
  config?: DomainConstraintConfig | null;
}

@Injectable()
export class UpdateDomainAttributeUseCase {
  constructor(
    @Inject(DOMAIN_MODEL_REPOSITORY)
    private readonly repo: DomainModelRepository,
  ) {}

  async execute(input: UpdateDomainAttributeInput) {
    await this.repo.ensureEditorAccess(input.projectId, input.actorId);

    const payload: {
      name?: string;
      type?: DomainAttributeType;
      required?: boolean;
      config?: DomainConstraintConfig | null;
    } = {};

    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed)
        throw new BadRequestException('El nombre del atributo es obligatorio');
      payload.name = trimmed;
    }

    if (input.type !== undefined) {
      payload.type = this.parseType(input.type);
    }

    if (input.required !== undefined) {
      payload.required = input.required;
    }

    if (input.config !== undefined) {
      payload.config = input.config ? this.validateConfig(input.config) : null;
    }

    return this.repo.updateAttribute({
      projectId: input.projectId,
      actorId: input.actorId,
      attributeId: input.attributeId,
      name: payload.name,
      type: payload.type,
      required: payload.required,
      config: payload.config,
    });
  }

  private parseType(raw: string): DomainAttributeType {
    const normalized = raw?.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('Debe indicar un tipo valido');
    }
    if (
      !Object.values(DomainAttributeType).includes(
        normalized as DomainAttributeType,
      )
    ) {
      throw new BadRequestException('Tipo de atributo no soportado');
    }
    return normalized as DomainAttributeType;
  }

  private validateConfig(
    config: DomainConstraintConfig,
  ): DomainConstraintConfig {
    const result: DomainConstraintConfig = {};

    if (config.lengthMin !== undefined) {
      if (config.lengthMin < 0)
        throw new BadRequestException('lengthMin debe ser positivo');
      result.lengthMin = Math.floor(config.lengthMin);
    }

    if (config.lengthMax !== undefined) {
      if (config.lengthMax <= 0) {
        throw new BadRequestException('lengthMax debe ser mayor que cero');
      }
      result.lengthMax = Math.floor(config.lengthMax);
    }

    if (
      result.lengthMin !== undefined &&
      result.lengthMax !== undefined &&
      result.lengthMin > result.lengthMax
    ) {
      throw new BadRequestException(
        'lengthMin no puede ser mayor que lengthMax',
      );
    }

    if (config.min !== undefined) {
      result.min = config.min;
    }
    if (config.max !== undefined) {
      result.max = config.max;
    }
    if (
      result.min !== undefined &&
      result.max !== undefined &&
      result.min > result.max
    ) {
      throw new BadRequestException('min no puede ser mayor que max');
    }

    if (config.scale !== undefined) {
      if (config.scale < 0)
        throw new BadRequestException('scale debe ser positivo');
      result.scale = Math.floor(config.scale);
    }
    if (config.precision !== undefined) {
      if (config.precision <= 0) {
        throw new BadRequestException('precision debe ser mayor que cero');
      }
      result.precision = Math.floor(config.precision);
    }

    if (config.pattern !== undefined) {
      const trimmed = config.pattern.trim();
      if (!trimmed)
        throw new BadRequestException('pattern no puede estar vacio');
      result.pattern = trimmed;
    }

    return result;
  }
}
