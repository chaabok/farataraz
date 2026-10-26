import { Repository } from 'typeorm';
import { ReportSorting } from '../../domain/entities/report-sorting.entity';
import { IReportSortingRepository } from '../../domain/repositories/report-sorting.repository.interface';
export declare class ReportSortingRepository implements IReportSortingRepository {
    private readonly repository;
    constructor(repository: Repository<ReportSorting>);
    findByReportId(reportId: string): Promise<ReportSorting[]>;
    findById(id: string): Promise<ReportSorting | null>;
    create(reportSorting: ReportSorting): Promise<ReportSorting>;
    update(id: string, reportSorting: Partial<ReportSorting>): Promise<ReportSorting>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
