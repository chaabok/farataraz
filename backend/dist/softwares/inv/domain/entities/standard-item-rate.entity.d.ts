import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class StandardItemRate extends AppBaseEntity {
    StandardItemRateID: number;
    FiscalYearRef?: number;
    ItemAccountCategoryRef: number;
    EffectiveDate: string;
    Description: string;
}
