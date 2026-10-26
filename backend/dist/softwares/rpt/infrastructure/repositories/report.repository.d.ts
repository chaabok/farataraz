import { Repository } from 'typeorm';
import { Report } from '../../domain/entities/report.entity';
import { IReportRepository } from '../../domain/repositories/report.repository.interface';
export declare class ReportRepository implements IReportRepository {
    private readonly repository;
    constructor(repository: Repository<Report>);
    findAll(companyRef?: string, businessStructureRef?: string, targetForm?: string): Promise<Report[]>;
    findById(id: string): Promise<Report | null>;
    create(report: Report): Promise<Report>;
    update(id: string, report: Partial<Report>): Promise<Report>;
    delete(id: string): Promise<void>;
}
