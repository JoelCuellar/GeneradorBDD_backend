import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateDomainClassUseCase } from '../../application/create-class.usecase';
import { UpdateDomainClassUseCase } from '../../application/update-class.usecase';
import { DeleteDomainClassUseCase } from '../../application/delete-class.usecase';
import { CreateDomainAttributeUseCase } from '../../application/create-attribute.usecase';
import { UpdateDomainAttributeUseCase } from '../../application/update-attribute.usecase';
import { DeleteDomainAttributeUseCase } from '../../application/delete-attribute.usecase';
import { CreateDomainRelationUseCase } from '../../application/create-relation.usecase';
import { UpdateDomainRelationUseCase } from '../../application/update-relation.usecase';
import { DeleteDomainRelationUseCase } from '../../application/delete-relation.usecase';
import { DefineIdentityUseCase } from '../../application/define-identity.usecase';
import { RemoveIdentityUseCase } from '../../application/remove-identity.usecase';
import { GetDomainModelUseCase } from '../../application/get-domain-model.usecase';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

class ActorDto {
  @IsUUID()
  actorId!: string;
}

class CreateClassDto extends ActorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

class UpdateClassDto extends ActorDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

class CreateAttributeDto extends ActorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  config?: Record<string, unknown>;
}

class UpdateAttributeDto extends ActorDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  config?: Record<string, unknown> | null;
}

class CreateRelationDto extends ActorDto {
  @IsUUID()
  sourceClassId!: string;

  @IsUUID()
  targetClassId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  sourceRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  targetRole?: string;

  @IsString()
  sourceMultiplicity!: string;

  @IsString()
  targetMultiplicity!: string;
}

class UpdateRelationDto extends ActorDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  sourceRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  targetRole?: string;

  @IsOptional()
  @IsString()
  sourceMultiplicity?: string;

  @IsOptional()
  @IsString()
  targetMultiplicity?: string;
}

class DefineIdentityDto extends ActorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUUID()
  identityId?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  attributeIds!: string[];
}

@Controller('projects/:projectId/domain')
export class DomainModelController {
  constructor(
    private readonly getModel: GetDomainModelUseCase,
    private readonly createClass: CreateDomainClassUseCase,
    private readonly updateClass: UpdateDomainClassUseCase,
    private readonly deleteClass: DeleteDomainClassUseCase,
    private readonly createAttribute: CreateDomainAttributeUseCase,
    private readonly updateAttribute: UpdateDomainAttributeUseCase,
    private readonly deleteAttribute: DeleteDomainAttributeUseCase,
    private readonly createRelation: CreateDomainRelationUseCase,
    private readonly updateRelation: UpdateDomainRelationUseCase,
    private readonly deleteRelation: DeleteDomainRelationUseCase,
    private readonly defineIdentity: DefineIdentityUseCase,
    private readonly removeIdentity: RemoveIdentityUseCase,
  ) {}

  @Get()
  getModelEndpoint(@Param('projectId') projectId: string, @Query() query: ActorDto) {
    return this.getModel.execute({ projectId, actorId: query.actorId });
  }

  @Post('classes')
  createClassEndpoint(@Param('projectId') projectId: string, @Body() dto: CreateClassDto) {
    return this.createClass.execute({
      projectId,
      actorId: dto.actorId,
      name: dto.name,
      description: dto.description ?? null,
    });
  }

  @Patch('classes/:classId')
  updateClassEndpoint(
    @Param('projectId') projectId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.updateClass.execute({
      projectId,
      actorId: dto.actorId,
      classId,
      name: dto.name,
      description: dto.description ?? null,
    });
  }

  @Delete('classes/:classId')
  deleteClassEndpoint(
    @Param('projectId') projectId: string,
    @Param('classId') classId: string,
    @Body() dto: ActorDto,
  ) {
    return this.deleteClass.execute({ projectId, actorId: dto.actorId, classId });
  }

  @Post('classes/:classId/attributes')
  createAttributeEndpoint(
    @Param('projectId') projectId: string,
    @Param('classId') classId: string,
    @Body() dto: CreateAttributeDto,
  ) {
    return this.createAttribute.execute({
      projectId,
      actorId: dto.actorId,
      classId,
      name: dto.name,
      type: dto.type,
      required: dto.required,
      config: dto.config as Record<string, unknown> | undefined,
    });
  }

  @Patch('attributes/:attributeId')
  updateAttributeEndpoint(
    @Param('projectId') projectId: string,
    @Param('attributeId') attributeId: string,
    @Body() dto: UpdateAttributeDto,
  ) {
    return this.updateAttribute.execute({
      projectId,
      actorId: dto.actorId,
      attributeId,
      name: dto.name,
      type: dto.type,
      required: dto.required,
      config: dto.config ?? undefined,
    });
  }

  @Delete('attributes/:attributeId')
  deleteAttributeEndpoint(
    @Param('projectId') projectId: string,
    @Param('attributeId') attributeId: string,
    @Body() dto: ActorDto,
  ) {
    return this.deleteAttribute.execute({ projectId, actorId: dto.actorId, attributeId });
  }

  @Post('relations')
  createRelationEndpoint(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRelationDto,
  ) {
    return this.createRelation.execute({
      projectId,
      actorId: dto.actorId,
      sourceClassId: dto.sourceClassId,
      targetClassId: dto.targetClassId,
      name: dto.name,
      sourceRole: dto.sourceRole,
      targetRole: dto.targetRole,
      sourceMultiplicity: dto.sourceMultiplicity,
      targetMultiplicity: dto.targetMultiplicity,
    });
  }

  @Patch('relations/:relationId')
  updateRelationEndpoint(
    @Param('projectId') projectId: string,
    @Param('relationId') relationId: string,
    @Body() dto: UpdateRelationDto,
  ) {
    return this.updateRelation.execute({
      projectId,
      actorId: dto.actorId,
      relationId,
      name: dto.name,
      sourceRole: dto.sourceRole,
      targetRole: dto.targetRole,
      sourceMultiplicity: dto.sourceMultiplicity,
      targetMultiplicity: dto.targetMultiplicity,
    });
  }

  @Delete('relations/:relationId')
  deleteRelationEndpoint(
    @Param('projectId') projectId: string,
    @Param('relationId') relationId: string,
    @Body() dto: ActorDto,
  ) {
    return this.deleteRelation.execute({ projectId, actorId: dto.actorId, relationId });
  }

  @Post('classes/:classId/identities')
  defineIdentityEndpoint(
    @Param('projectId') projectId: string,
    @Param('classId') classId: string,
    @Body() dto: DefineIdentityDto,
  ) {
    return this.defineIdentity.execute({
      projectId,
      actorId: dto.actorId,
      classId,
      identityId: dto.identityId,
      name: dto.name,
      description: dto.description ?? null,
      attributeIds: dto.attributeIds,
    });
  }

  @Delete('identities/:identityId')
  removeIdentityEndpoint(
    @Param('projectId') projectId: string,
    @Param('identityId') identityId: string,
    @Body() dto: ActorDto,
  ) {
    return this.removeIdentity.execute({ projectId, actorId: dto.actorId, identityId });
  }
}


