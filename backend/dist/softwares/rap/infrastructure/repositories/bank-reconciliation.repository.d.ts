import { DataSource, Repository } from 'typeorm';
import { BankReconciliation } from '../../domain/entities/bank-reconciliation.entity';
import { IBankReconciliationRepository } from '../../domain/repositories/bank-reconciliation.repository.interface';
export declare class BankReconciliationRepository extends Repository<BankReconciliation> implements IBankReconciliationRepository {
    private dataSource;
    constructor(dataSource: DataSource);
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
