import { ReportField } from '../entities/report-field.entity';

export interface IReportFieldRepository {
  findByReportId(reportId: string): Promise<ReportField[]>;
  findById(id: string): Promise<ReportField | null>;
  create(reportField: ReportField): Promise<ReportField>;
  update(id: string, reportField: Partial<ReportField>): Promise<ReportField>;
  delete(id: string): Promise<void>;
  deleteByReportId(reportId: string): Promise<void>;
}

export const IReportFieldRepository = Symbol('IReportFieldRepository');
