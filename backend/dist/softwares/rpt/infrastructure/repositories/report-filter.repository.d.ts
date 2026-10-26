import { Repository } from 'typeorm';
import { ReportFilter } from '../../domain/entities/report-filter.entity';
import { IReportFilterRepository } from '../../domain/repositories/report-filter.repository.interface';
export declare class ReportFilterRepository implements IReportFilterRepository {
    private readonly repository;
    constructor(repository: Repository<ReportFilter>);
    findByReportId(reportId: string): Promise<ReportFilter[]>;
    findById(id: string): Promise<ReportFilter | null>;
    create(reportFilter: ReportFilter): Promise<ReportFilter>;
    update(id: string, reportFilter: Partial<ReportFilter>): Promise<ReportFilter>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
