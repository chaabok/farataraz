import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './domain/entities/project.entity';
import { Contract } from './domain/entities/contract.entity';
import { ProjectService } from './application/services/project.service';
import { ContractService } from './application/services/contract.service';
import { ProjectController } from './application/controllers/project.controller';
import { ContractController } from './application/controllers/contract.controller';
import { DetailedType } from '../accounting/domain/entities/detailed-type.entity';
import { DetailedAccountsNumbering } from '../common/domain/entities/detailed-accounts-numbering.entity';

import { AccountingModule } from '../accounting/accounting.module';
import { CommonModule } from '../common/common.module';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Contract,
      DetailedType, 
      DetailedAccountsNumbering
    ]),
    AccountingModule,
    CommonModule,
    CoreModule,
  ],
  controllers: [ProjectController, ContractController],
  providers: [ProjectService, ContractService],
  exports: [ProjectService, ContractService],
})
export class CntModule {}
