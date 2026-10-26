import { ReconcileBankStatement } from '../entities/reconcile-bank-statement.entity';
export declare const IReconcileBankStatementRepositoryToken = "IReconcileBankStatementRepository";
export interface IReconcileBankStatementRepository {
    findAll(businessStructureRef: number, companyRef: number, fiscalYearRef: number): Promise<ReconcileBankStatement[]>;
    findById(id: number, businessStructureRef: number, companyRef: number, fiscalYearRef: number): Promise<ReconcileBankStatement | null>;
    create(data: ReconcileBankStatement): Promise<ReconcileBankStatement>;
    update(data: ReconcileBankStatement): Promise<ReconcileBankStatement>;
    delete(id: number, businessStructureRef: number, companyRef: number): Promise<void>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    findLatestByBankAccount(bankAccountRef: number, businessStructureRef: number, companyRef: number): Promise<ReconcileBankStatement | null>;
}
