import { Repository } from 'typeorm';
import { ReconcileBankStatement } from '../../domain/entities/reconcile-bank-statement.entity';
import { IReconcileBankStatementRepository } from '../../domain/repositories/reconcile-bank-statement.repository.interface';
export declare class ReconcileBankStatementRepository implements IReconcileBankStatementRepository {
    private readonly repository;
    constructor(repository: Repository<ReconcileBankStatement>);
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    findAll(businessStructureRef: number, companyRef: number, fiscalYearRef: number): Promise<ReconcileBankStatement[]>;
    findById(id: number, businessStructureRef: number, companyRef: number, fiscalYearRef: number): Promise<ReconcileBankStatement | null>;
    create(data: ReconcileBankStatement): Promise<ReconcileBankStatement>;
    update(data: ReconcileBankStatement): Promise<ReconcileBankStatement>;
    delete(id: number, businessStructureRef: number, companyRef: number): Promise<void>;
    findLatestByBankAccount(bankAccountRef: number, businessStructureRef: number, companyRef: number): Promise<ReconcileBankStatement | null>;
}
