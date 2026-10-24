import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankBranch } from './bank-branch.entity';
import { BankAccountType } from './bank-account-type.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
export declare class BankAccount extends AppBaseEntity {
    bankAccountId: number;
    bankBranchRef: number;
    bankBranch: BankBranch;
    bankAccountTypeRef: number;
    bankAccountType: BankAccountType;
    accountNumber: string;
    title: string;
    latinTitle: string;
    shabaNumber: string;
    detailedCode: number;
    accountRef: number | null;
    account: Account;
    currencyRef: number | null;
    currency: Currency;
    initialBalance: number;
    openingDate: Date;
    accountHolderName: string;
    isActive: boolean;
}
