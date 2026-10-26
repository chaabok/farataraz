import { UpsertReportDto } from '../dtos/upsert-report.dto';
import { IReportRepository } from '../../domain/repositories/report.repository.interface';
import { IReportFieldRepository } from '../../domain/repositories/report-field.repository.interface';
import { IReportGroupingRepository } from '../../domain/repositories/report-grouping.repository.interface';
import { IReportFilterRepository } from '../../domain/repositories/report-filter.repository.interface';
import { IReportSortingRepository } from '../../domain/repositories/report-sorting.repository.interface';
import { IReportFormulaRepository } from '../../domain/repositories/report-formula.repository.interface';
import { IReportAggregateRepository } from '../../domain/repositories/report-aggregate.repository.interface';
import { Report } from '../../domain/entities/report.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class ReportService {
    private readonly reportRepository;
    private readonly reportFieldRepository;
    private readonly reportGroupingRepository;
    private readonly reportFilterRepository;
    private readonly reportSortingRepository;
    private readonly reportFormulaRepository;
    private readonly reportAggregateRepository;
    private readonly idGenerationService;
    constructor(reportRepository: IReportRepository, reportFieldRepository: IReportFieldRepository, reportGroupingRepository: IReportGroupingRepository, reportFilterRepository: IReportFilterRepository, reportSortingRepository: IReportSortingRepository, reportFormulaRepository: IReportFormulaRepository, reportAggregateRepository: IReportAggregateRepository, idGenerationService: IdGenerationService);
    findAll(companyRef?: string, businessStructureRef?: string, targetForm?: string): Promise<Report[]>;
    findById(id: string): Promise<any>;
    upsert(dto: UpsertReportDto, companyRef: string, businessStructureRef: string): Promise<any>;
    delete(id: string): Promise<void>;
}
