import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Party } from '../../../common/domain/entities/party.entity';
export declare class PettyCash extends AppBaseEntity {
    pettyCashId: number;
    title: string;
    currencyId: number;
    currency: Currency;
    openingDate: Date;
    initialBalance: number;
    pettyCashLimit: number;
    currentBalance: number;
    accountRef: number;
    account: Account;
    partyRef: number;
    party: Party;
    isPettyCashLimitControlled: boolean;
    isActive: boolean;
}
