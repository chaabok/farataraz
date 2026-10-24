export declare class CreateStocktakingSettingDto {
    StocktakingSettingID?: number;
    MethodName?: string;
    CountTimes?: number;
    CountWithTrackingFactors?: boolean;
    Count1MinQty?: number;
    Count1MinRial?: number;
    Count1MinTurnover?: number;
    Count2ListType?: string;
    Count2DiscrepancyPercent?: number;
    Count3CombineType?: string;
    Count3DiscrepancyPercent?: number;
    Count3Discrepancy1And2?: boolean;
    Count3Discrepancy1AndInv?: boolean;
    Count3Discrepancy2AndInv?: boolean;
    warehouseIds?: number[];
}
export declare class UpdateStocktakingSettingDto extends CreateStocktakingSettingDto {
}
