import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from './account.entity';
export declare class AccountsVoucherDecriptions extends AppBaseEntity {
    id: number;
    accountId: number;
    account: Account;
    description: string;
    description2: string;
}
