import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { AccountsRelatedDetailedAccount } from './accounts-related-detailed-account.entity';
import { AccountsNatureAdjusting } from './accounts-nature-adjusting.entity';
import { AccountsVoucherDecriptions } from './accounts-voucher-decriptions.entity';
export declare class Account extends AppBaseEntity {
    id: number;
    code: string;
    title: string;
    title_en: string;
    parentId: number;
    parent: Account;
    accountType: number;
    accountNature: number;
    natureControl: number;
    isActive: boolean;
    trackingFeature: boolean;
    currencyFeature: boolean;
    exchangeableFeature: boolean;
    trackingQuantity: boolean;
    trackingNumber: boolean;
    trackingDate: boolean;
    relatedDetailedAccounts: AccountsRelatedDetailedAccount[];
    natureAdjustments: AccountsNatureAdjusting[];
    frequentDescriptions: AccountsVoucherDecriptions[];
}
