import { Repository } from 'typeorm';
import { ReportField } from '../../domain/entities/report-field.entity';
import { IReportFieldRepository } from '../../domain/repositories/report-field.repository.interface';
export declare class ReportFieldRepository implements IReportFieldRepository {
    private readonly repository;
    constructor(repository: Repository<ReportField>);
    findByReportId(reportId: string): Promise<ReportField[]>;
    findById(id: string): Promise<ReportField | null>;
    create(reportField: ReportField): Promise<ReportField>;
    update(id: string, reportField: Partial<ReportField>): Promise<ReportField>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
