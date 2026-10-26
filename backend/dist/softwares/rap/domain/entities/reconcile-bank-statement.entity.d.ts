import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReconcileBankStatementItem } from './reconcile-bank-statement-item.entity';
import { BankAccount } from './bank-account.entity';
export declare class ReconcileBankStatement extends AppBaseEntity {
    ReconcileBankStatementID: number;
    BankAccountRef: number;
    bankAccount: BankAccount;
    Number: string;
    Date: string;
    fromDate: string;
    previousBalance: number;
    balance: number;
    fiscalYearRef: number;
    items: ReconcileBankStatementItem[];
}
