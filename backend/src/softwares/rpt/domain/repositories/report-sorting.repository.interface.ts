import { ReportSorting } from '../entities/report-sorting.entity';

export interface IReportSortingRepository {
  findByReportId(reportId: string): Promise<ReportSorting[]>;
  findById(id: string): Promise<ReportSorting | null>;
  create(reportSorting: ReportSorting): Promise<ReportSorting>;
  update(id: string, reportSorting: Partial<ReportSorting>): Promise<ReportSorting>;
  delete(id: string): Promise<void>;
  deleteByReportId(reportId: string): Promise<void>;
}

export const IReportSortingRepository = Symbol('IReportSortingRepository');
