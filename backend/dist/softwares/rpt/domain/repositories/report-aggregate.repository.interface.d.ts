import { ReportAggregate } from '../entities/report-aggregate.entity';
export declare const IReportAggregateRepository: unique symbol;
export interface IReportAggregateRepository {
    create(aggregate: ReportAggregate): Promise<ReportAggregate>;
    findByReportId(reportId: string): Promise<ReportAggregate[]>;
    deleteByReportId(reportId: string): Promise<void>;
}
