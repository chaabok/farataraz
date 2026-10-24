import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { MeasurementUnit } from './measurement-unit.entity';
import { ItemAccountCategory } from './item-account-category.entity';
export declare class Item extends AppBaseEntity {
    ItemID: number;
    ItemType: number;
    ItemCode: number;
    ItemName: string;
    ItemName2: string;
    MeasurementUnitRef: number;
    MeasurementUnit?: MeasurementUnit;
    TechnicalSpecification: string;
    DetailedAccountCode: string;
    TaxRate: number;
    DutyRate: number;
    IranCode: string;
    ItemAccountCategoryRef: number;
    ItemAccountCategory?: ItemAccountCategory;
    PricingMethod: number;
    TaxAndDutyExemption: number;
    IsSalable: boolean;
    IsActive: boolean;
}
