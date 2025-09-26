import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { DomainModelController } from './interface/http/domain-model.controller';
import { DomainValidationController } from './interface/http/domain-validation.controller';
import { DOMAIN_MODEL_REPOSITORY } from './domain/domain-model.repository';
import { PrismaDomainModelRepository } from './infrastructure/prisma-domain-model.repository';
import { DOMAIN_VALIDATION_REPOSITORY } from './domain/domain-validation.repository';
import { PrismaDomainValidationRepository } from './infrastructure/prisma-domain-validation.repository';
import { CreateDomainClassUseCase } from './application/create-class.usecase';
import { UpdateDomainClassUseCase } from './application/update-class.usecase';
import { DeleteDomainClassUseCase } from './application/delete-class.usecase';
import { CreateDomainAttributeUseCase } from './application/create-attribute.usecase';
import { UpdateDomainAttributeUseCase } from './application/update-attribute.usecase';
import { DeleteDomainAttributeUseCase } from './application/delete-attribute.usecase';
import { CreateDomainRelationUseCase } from './application/create-relation.usecase';
import { UpdateDomainRelationUseCase } from './application/update-relation.usecase';
import { DeleteDomainRelationUseCase } from './application/delete-relation.usecase';
import { DefineIdentityUseCase } from './application/define-identity.usecase';
import { RemoveIdentityUseCase } from './application/remove-identity.usecase';
import { GetDomainModelUseCase } from './application/get-domain-model.usecase';
import { RunDomainValidationsUseCase } from './application/run-validations.usecase';
import { ListDomainValidationsUseCase } from './application/list-validations.usecase';
import { IgnoreDomainValidationUseCase } from './application/ignore-validation.usecase';
import { ReopenDomainValidationUseCase } from './application/reopen-validation.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [DomainModelController, DomainValidationController],
  providers: [
    { provide: DOMAIN_MODEL_REPOSITORY, useClass: PrismaDomainModelRepository },
    { provide: DOMAIN_VALIDATION_REPOSITORY, useClass: PrismaDomainValidationRepository },
    CreateDomainClassUseCase,
    UpdateDomainClassUseCase,
    DeleteDomainClassUseCase,
    CreateDomainAttributeUseCase,
    UpdateDomainAttributeUseCase,
    DeleteDomainAttributeUseCase,
    CreateDomainRelationUseCase,
    UpdateDomainRelationUseCase,
    DeleteDomainRelationUseCase,
    DefineIdentityUseCase,
    RemoveIdentityUseCase,
    GetDomainModelUseCase,
    RunDomainValidationsUseCase,
    ListDomainValidationsUseCase,
    IgnoreDomainValidationUseCase,
    ReopenDomainValidationUseCase,
  ],
})
export class DomainModelModule {}
