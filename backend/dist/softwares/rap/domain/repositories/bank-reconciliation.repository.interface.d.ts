import { BankReconciliation } from '../entities/bank-reconciliation.entity';
import { Repository } from 'typeorm';
export interface IBankReconciliationRepository extends Repository<BankReconciliation> {
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
export declare const IBankReconciliationRepositoryToken = "IBankReconciliationRepository";
