import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankAccount } from './bank-account.entity';
import { ReconcileBankStatement } from './reconcile-bank-statement.entity';
import { BankReconciliationItem } from './bank-reconciliation-item.entity';
export declare class BankReconciliation extends AppBaseEntity {
    BankReconciliationID: number;
    BankAccountRef: number;
    bankAccount: BankAccount;
    ReconcileBankStatementRef: number;
    bankStatement: ReconcileBankStatement;
    Number: string;
    Date: string;
    isOpening: boolean;
    items: BankReconciliationItem[];
}
