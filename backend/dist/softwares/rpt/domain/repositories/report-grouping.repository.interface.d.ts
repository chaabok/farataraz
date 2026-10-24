import { ReportGrouping } from '../entities/report-grouping.entity';
export interface IReportGroupingRepository {
    findByReportId(reportId: string): Promise<ReportGrouping[]>;
    findById(id: string): Promise<ReportGrouping | null>;
    create(reportGrouping: ReportGrouping): Promise<ReportGrouping>;
    update(id: string, reportGrouping: Partial<ReportGrouping>): Promise<ReportGrouping>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
export declare const IReportGroupingRepository: unique symbol;
