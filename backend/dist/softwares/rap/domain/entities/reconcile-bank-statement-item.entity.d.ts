import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReconcileBankStatement } from './reconcile-bank-statement.entity';
export declare class ReconcileBankStatementItem extends AppBaseEntity {
    ReconcileBankStatementItemID: number;
    ReconcileBankStatementRef: number;
    statement: ReconcileBankStatement;
    documentNumber: string;
    documentDate: string;
    debit: number;
    credit: number;
    description: string;
}
