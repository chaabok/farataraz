import { Repository } from 'typeorm';
import { ReportAggregate } from '../../domain/entities/report-aggregate.entity';
import { IReportAggregateRepository } from '../../domain/repositories/report-aggregate.repository.interface';
export declare class ReportAggregateRepository implements IReportAggregateRepository {
    private readonly repo;
    constructor(repo: Repository<ReportAggregate>);
    create(aggregate: ReportAggregate): Promise<ReportAggregate>;
    findByReportId(reportId: string): Promise<ReportAggregate[]>;
    deleteByReportId(reportId: string): Promise<void>;
}
