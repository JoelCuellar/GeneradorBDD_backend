import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { DomainModelController } from './interface/http/domain-model.controller';
import { DOMAIN_MODEL_REPOSITORY } from './domain/domain-model.repository';
import { PrismaDomainModelRepository } from './infrastructure/prisma-domain-model.repository';
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

@Module({
  imports: [PrismaModule],
  controllers: [DomainModelController],
  providers: [
    { provide: DOMAIN_MODEL_REPOSITORY, useClass: PrismaDomainModelRepository },
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
  ],
})
export class DomainModelModule {}
