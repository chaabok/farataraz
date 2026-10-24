import { Repository } from 'typeorm';
import { ReportGrouping } from '../../domain/entities/report-grouping.entity';
import { IReportGroupingRepository } from '../../domain/repositories/report-grouping.repository.interface';
export declare class ReportGroupingRepository implements IReportGroupingRepository {
    private readonly repository;
    constructor(repository: Repository<ReportGrouping>);
    findByReportId(reportId: string): Promise<ReportGrouping[]>;
    findById(id: string): Promise<ReportGrouping | null>;
    create(reportGrouping: ReportGrouping): Promise<ReportGrouping>;
    update(id: string, reportGrouping: Partial<ReportGrouping>): Promise<ReportGrouping>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
