import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from './account.entity';
export declare class AccountsNatureAdjusting extends AppBaseEntity {
    id: number;
    accountId: number;
    account: Account;
    moinCode: string;
    moinTitle: string;
    nature: string;
    description: string;
    description2: string;
}
