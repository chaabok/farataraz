export declare class StocktakingCountTrackingFactorDto {
    StocktakingCountTrackingFactorID?: number;
    TrackingFactorRef: number;
    FactorValue?: string;
    CountedQuantity: number;
}
export declare class StocktakingCountDetailDto {
    StocktakingCountDetailID?: number;
    RowNumber: number;
    ItemRef: number;
    TagNumber?: string;
    CountedQuantity: number;
    Description?: string;
    trackingFactors?: StocktakingCountTrackingFactorDto[];
}
export declare class CreateStocktakingCountDto {
    StocktakingTagHeaderRef: number;
    WarehouseRef: number;
    StocktakingDate: string;
    StocktakingNumber?: number;
    CountRound?: number;
    Status?: number;
    Description?: string;
    FiscalYearRef?: number;
    BusinessStructureRef?: number;
    CompanyRef?: number;
    details?: StocktakingCountDetailDto[];
}
export declare class UpdateStocktakingCountDto extends CreateStocktakingCountDto {
    StocktakingCountID?: number;
}
