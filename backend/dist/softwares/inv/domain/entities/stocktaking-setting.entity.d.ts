import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { StocktakingSettingWarehouse } from './stocktaking-setting-warehouse.entity';
export declare class StocktakingSetting extends AppBaseEntity {
    StocktakingSettingID: number;
    MethodName: string;
    CountTimes: number;
    CountWithTrackingFactors: boolean;
    Count1MinQty: number;
    Count1MinRial: number;
    Count1MinTurnover: number;
    Count2ListType: string;
    Count2DiscrepancyPercent: number;
    Count3CombineType: string;
    Count3DiscrepancyPercent: number;
    Count3Discrepancy1And2: boolean;
    Count3Discrepancy1AndInv: boolean;
    Count3Discrepancy2AndInv: boolean;
    warehouses?: StocktakingSettingWarehouse[];
}
