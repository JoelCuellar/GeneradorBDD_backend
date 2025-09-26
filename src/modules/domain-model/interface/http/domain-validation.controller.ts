import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RunDomainValidationsUseCase } from '../../application/run-validations.usecase';
import { ListDomainValidationsUseCase } from '../../application/list-validations.usecase';
import { IgnoreDomainValidationUseCase } from '../../application/ignore-validation.usecase';
import { ReopenDomainValidationUseCase } from '../../application/reopen-validation.usecase';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

class ActorDto {
  @IsUUID()
  actorId!: string;
}

class RunValidationDto extends ActorDto {}

class IgnoreValidationDto extends ActorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  justification!: string;
}

class ReopenValidationDto extends ActorDto {}

@Controller('projects/:projectId/domain/validations')
export class DomainValidationController {
  constructor(
    private readonly runValidations: RunDomainValidationsUseCase,
    private readonly listValidations: ListDomainValidationsUseCase,
    private readonly ignoreValidation: IgnoreDomainValidationUseCase,
    private readonly reopenValidation: ReopenDomainValidationUseCase,
  ) {}

  @Post('run')
  run(
    @Param('projectId') projectId: string,
    @Body() dto: RunValidationDto,
  ) {
    return this.runValidations.execute({ projectId, actorId: dto.actorId });
  }

  @Get()
  list(
    @Param('projectId') projectId: string,
    @Query() query: ActorDto,
  ) {
    return this.listValidations.execute({ projectId, actorId: query.actorId });
  }

  @Patch(':findingId/ignore')
  ignore(
    @Param('projectId') projectId: string,
    @Param('findingId') findingId: string,
    @Body() dto: IgnoreValidationDto,
  ) {
    return this.ignoreValidation.execute({
      projectId,
      findingId,
      actorId: dto.actorId,
      justification: dto.justification,
    });
  }

  @Patch(':findingId/reopen')
  reopen(
    @Param('projectId') projectId: string,
    @Param('findingId') findingId: string,
    @Body() dto: ReopenValidationDto,
  ) {
    return this.reopenValidation.execute({
      projectId,
      findingId,
      actorId: dto.actorId,
    });
  }
}
