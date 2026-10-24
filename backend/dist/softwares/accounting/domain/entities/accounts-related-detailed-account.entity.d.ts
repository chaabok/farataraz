import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from './account.entity';
import { DetailedType } from './detailed-type.entity';
export declare class AccountsRelatedDetailedAccount extends AppBaseEntity {
    id: number;
    accountId: number;
    account: Account;
    detailedLevel: number;
    detailedTypeId: number;
    detailedType: DetailedType;
}
