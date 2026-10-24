import { ReportGroup } from '../entities/report-group.entity';

export interface IReportGroupRepository {
  findAll(companyRef?: string, businessStructureRef?: string): Promise<ReportGroup[]>;
  findById(id: string): Promise<ReportGroup | null>;
  create(reportGroup: ReportGroup): Promise<ReportGroup>;
  update(id: string, reportGroup: Partial<ReportGroup>): Promise<ReportGroup>;
  delete(id: string): Promise<void>;
}

export const IReportGroupRepository = Symbol('IReportGroupRepository');
