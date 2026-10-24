import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CoreModule } from '../../core/core.module';
import { ReportGroup } from './domain/entities/report-group.entity';
import { Report } from './domain/entities/report.entity';
import { ReportField } from './domain/entities/report-field.entity';
import { ReportGrouping } from './domain/entities/report-grouping.entity';
import { ReportFilter } from './domain/entities/report-filter.entity';
import { ReportSorting } from './domain/entities/report-sorting.entity';
import { ReportPermission } from './domain/entities/report-permission.entity';
import { ReportUserData } from './domain/entities/report-user-data.entity';
import { ReportFormula } from './domain/entities/report-formula.entity';
import { ReportAggregate } from './domain/entities/report-aggregate.entity';

import { IReportGroupRepository } from './domain/repositories/report-group.repository.interface';
import { IReportRepository } from './domain/repositories/report.repository.interface';
import { IReportFieldRepository } from './domain/repositories/report-field.repository.interface';
import { IReportGroupingRepository } from './domain/repositories/report-grouping.repository.interface';
import { IReportFilterRepository } from './domain/repositories/report-filter.repository.interface';
import { IReportSortingRepository } from './domain/repositories/report-sorting.repository.interface';
import { IReportFormulaRepository } from './domain/repositories/report-formula.repository.interface';
import { IReportAggregateRepository } from './domain/repositories/report-aggregate.repository.interface';

import { ReportGroupRepository } from './infrastructure/repositories/report-group.repository';
import { ReportRepository } from './infrastructure/repositories/report.repository';
import { ReportFieldRepository } from './infrastructure/repositories/report-field.repository';
import { ReportGroupingRepository } from './infrastructure/repositories/report-grouping.repository';
import { ReportFilterRepository } from './infrastructure/repositories/report-filter.repository';
import { ReportSortingRepository } from './infrastructure/repositories/report-sorting.repository';
import { ReportUserDataRepository } from './infrastructure/repositories/report-user-data.repository';
import { ReportFormulaRepository } from './infrastructure/repositories/report-formula.repository';
import { ReportAggregateRepository } from './infrastructure/repositories/report-aggregate.repository';

import { ReportGroupService } from './application/services/report-group.service';
import { ReportService } from './application/services/report.service';
import { ReportUserDataService } from './application/services/report-user-data.service';

import { ReportGroupController } from './presentation/controllers/report-group.controller';
import { ReportController } from './presentation/controllers/report.controller';
import { ReportUserDataController } from './presentation/controllers/report-user-data.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportGroup,
      Report,
      ReportField,
      ReportGrouping,
      ReportFilter,
      ReportSorting,
      ReportPermission,
      ReportUserData,
      ReportFormula,
      ReportAggregate
    ]),
    CommonModule,
    CoreModule
  ],
  controllers: [
    ReportGroupController,
    ReportController,
    ReportUserDataController
  ],
  providers: [
    { provide: IReportGroupRepository, useClass: ReportGroupRepository },
    { provide: IReportRepository, useClass: ReportRepository },
    { provide: IReportFieldRepository, useClass: ReportFieldRepository },
    { provide: IReportGroupingRepository, useClass: ReportGroupingRepository },
    { provide: IReportFilterRepository, useClass: ReportFilterRepository },
    { provide: IReportSortingRepository, useClass: ReportSortingRepository },
    { provide: IReportFormulaRepository, useClass: ReportFormulaRepository },
    { provide: IReportAggregateRepository, useClass: ReportAggregateRepository },
    { provide: 'ReportUserDataRepositoryInterface', useClass: ReportUserDataRepository },
    ReportGroupService,
    ReportService,
    ReportUserDataService
  ],
  exports: [
    ReportGroupService,
    ReportService,
    ReportUserDataService
  ]
})
export class RptModule {}
