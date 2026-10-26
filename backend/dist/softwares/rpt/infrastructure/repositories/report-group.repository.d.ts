import { Repository } from 'typeorm';
import { ReportGroup } from '../../domain/entities/report-group.entity';
import { IReportGroupRepository } from '../../domain/repositories/report-group.repository.interface';
export declare class ReportGroupRepository implements IReportGroupRepository {
    private readonly repository;
    constructor(repository: Repository<ReportGroup>);
    findAll(companyRef?: string, businessStructureRef?: string): Promise<ReportGroup[]>;
    findById(id: string): Promise<ReportGroup | null>;
    create(reportGroup: ReportGroup): Promise<ReportGroup>;
    update(id: string, reportGroup: Partial<ReportGroup>): Promise<ReportGroup>;
    delete(id: string): Promise<void>;
}
