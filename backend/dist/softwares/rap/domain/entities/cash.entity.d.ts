import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Cashier } from './cashier.entity';
export declare class Cash extends AppBaseEntity {
    cashId: number;
    code: string;
    title: string;
    title_en: string;
    cashTypeId: number;
    detailedAccountId: number;
    detailedAccount: DetailedAccount;
    currencyId: number;
    currency: Currency;
    initialBalance: number;
    openingDate: Date;
    isActive: boolean;
    description: string;
    cashiers: Cashier[];
}
