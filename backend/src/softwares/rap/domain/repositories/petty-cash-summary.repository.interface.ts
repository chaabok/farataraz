import { PettyCashSummary } from '../entities/petty-cash-summary.entity';

export interface IPettyCashSummaryRepository {
  findAll(options: any): Promise<[PettyCashSummary[], number]>;
  findById(id: number): Promise<PettyCashSummary | null>;
  create(entity: PettyCashSummary): Promise<PettyCashSummary>;
  update(id: number, entity: Partial<PettyCashSummary>): Promise<PettyCashSummary>;
  delete(id: number): Promise<void>;
  isUsed(id: number): Promise<boolean>;
  calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }>;
}
