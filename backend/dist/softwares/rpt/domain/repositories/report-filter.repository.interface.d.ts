import { ReportFilter } from '../entities/report-filter.entity';
export interface IReportFilterRepository {
    findByReportId(reportId: string): Promise<ReportFilter[]>;
    findById(id: string): Promise<ReportFilter | null>;
    create(reportFilter: ReportFilter): Promise<ReportFilter>;
    update(id: string, reportFilter: Partial<ReportFilter>): Promise<ReportFilter>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
export declare const IReportFilterRepository: unique symbol;
