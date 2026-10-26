import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankReconciliation } from './bank-reconciliation.entity';
import { ReconcileBankStatementItem } from './reconcile-bank-statement-item.entity';
export declare class BankReconciliationItem extends AppBaseEntity {
    BankReconciliationItemID: number;
    BankReconciliationRef: number;
    bankReconciliation: BankReconciliation;
    BankStatementItemRef: number;
    bankStatementItem: ReconcileBankStatementItem;
    BookItemRef: string;
    matchId: string;
}
