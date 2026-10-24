import { ReportAggregate } from '../entities/report-aggregate.entity';

export const IReportAggregateRepository = Symbol('IReportAggregateRepository');

export interface IReportAggregateRepository {
  create(aggregate: ReportAggregate): Promise<ReportAggregate>;
  findByReportId(reportId: string): Promise<ReportAggregate[]>;
  deleteByReportId(reportId: string): Promise<void>;
}
