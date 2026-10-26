import { Report } from '../entities/report.entity';
export interface IReportRepository {
    findAll(companyRef?: string, businessStructureRef?: string, targetForm?: string): Promise<Report[]>;
    findById(id: string): Promise<Report | null>;
    create(report: Report): Promise<Report>;
    update(id: string, report: Partial<Report>): Promise<Report>;
    delete(id: string): Promise<void>;
}
export declare const IReportRepository: unique symbol;
