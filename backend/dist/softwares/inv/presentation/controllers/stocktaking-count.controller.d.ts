import { StocktakingCountService } from '../../application/services/stocktaking-count.service';
import { CreateStocktakingCountDto, UpdateStocktakingCountDto } from '../../application/dtos/stocktaking-count.dto';
export declare class StocktakingCountController {
    private readonly service;
    constructor(service: StocktakingCountService);
    getPeriods(fiscalYearId?: string): Promise<{
        StocktakingTagHeaderID: number;
        StocktakingPeriod: string;
        StocktakingNumber: number;
        StocktakingDate: string;
        OfficerPartyRef: number;
        OfficerPartyTitle: any;
        StocktakingSettingRef: number;
        MethodName: string;
        CountTimes: number;
        CountWithTrackingFactors: boolean;
        Count2ListType: string;
        Count2DiscrepancyPercent: number;
        Count3CombineType: string;
        Count3DiscrepancyPercent: number;
        Count3Discrepancy1And2: boolean;
        Count3Discrepancy1AndInv: boolean;
        Count3Discrepancy2AndInv: boolean;
        FiscalYearRef: number;
    }[]>;
    getWarehouses(tagHeaderId: number, excludeCompleted?: string, currentCountId?: string): Promise<any>;
    getWarehouseCountInfo(tagHeaderId: number, warehouseId: number): Promise<{
        nextRound: number;
        countTimes: number;
        existingCounts: any[];
        isCompleted: boolean;
        tagHeaderId?: undefined;
        warehouseId?: undefined;
        setting?: undefined;
    } | {
        tagHeaderId: number;
        warehouseId: number;
        countTimes: number;
        nextRound: number;
        isCompleted: boolean;
        existingCounts: {
            StocktakingCountID: number;
            CountRound: number;
            StocktakingNumber: number;
            StocktakingDate: string;
            itemsCount: number;
        }[];
        setting: {
            Count2ListType: string;
            Count2DiscrepancyPercent: number;
            Count3CombineType: string;
            Count3DiscrepancyPercent: number;
            Count3Discrepancy1And2: boolean;
            Count3Discrepancy1AndInv: boolean;
            Count3Discrepancy2AndInv: boolean;
        };
    }>;
    getItems(tagHeaderId: number, warehouseId: number, countId?: string, round?: string): Promise<{
        RowNumber: number;
        StocktakingTagDetailID: number;
        ItemRef: number;
        ItemCode: string;
        ItemTitle: string;
        MeasurementUnitName: string;
        TagNumber: string;
        CountedQuantity: number;
        Description: string;
        PreviousCount1Qty: number;
        PreviousCount2Qty: number;
        SystemStockQty: number;
        hasTrackingFactors: boolean;
        trackingFactors: any[];
        savedTrackingFactorValues: {
            StocktakingCountTrackingFactorID: number;
            TrackingFactorRef: number;
            FactorValue: string;
            CountedQuantity: number;
            TrackingFactorName: string;
        }[];
        hasSubUnits: boolean;
        subUnits: any[];
    }[]>;
    getNextNumber(fiscalYearId?: string, warehouseId?: string): Promise<string | number>;
    findAll(): Promise<import("../../domain/entities/stocktaking-count.entity").StocktakingCount[]>;
    findOne(id: number): Promise<import("../../domain/entities/stocktaking-count.entity").StocktakingCount>;
    create(dto: CreateStocktakingCountDto): Promise<import("../../domain/entities/stocktaking-count.entity").StocktakingCount>;
    update(id: number, dto: UpdateStocktakingCountDto): Promise<import("../../domain/entities/stocktaking-count.entity").StocktakingCount>;
    remove(id: number): Promise<import("../../domain/entities/stocktaking-count.entity").StocktakingCount>;
}
