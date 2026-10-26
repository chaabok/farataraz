import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class Currency extends AppBaseEntity {
    currencyID: number;
    code: number;
    title: string;
    titleEn: string;
    exchangeUnit: number;
    precisionCount: number;
    precisionTitle: string;
    precisionTitleEn: string;
    isActive: boolean;
}
