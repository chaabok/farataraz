import { ReportFormula } from '../entities/report-formula.entity';

export interface IReportFormulaRepository {
  findAll(reportId: string): Promise<ReportFormula[]>;
  findById(id: string): Promise<ReportFormula | null>;
  create(entity: Partial<ReportFormula>): Promise<ReportFormula>;
  update(id: string, entity: Partial<ReportFormula>): Promise<ReportFormula>;
  delete(id: string): Promise<void>;
  deleteByReportId(reportId: string): Promise<void>;
}

export const IReportFormulaRepository = Symbol('IReportFormulaRepository');
