import { StocktakingTagService } from '../../application/services/stocktaking-tag.service';
import { CreateStocktakingTagHeaderDto, UpdateStocktakingTagHeaderDto } from '../../application/dtos/stocktaking-tag.dto';
export declare class StocktakingTagController {
    private readonly service;
    constructor(service: StocktakingTagService);
    findAll(): Promise<any[]>;
    getWarehousesSummary(settingId: string, headerId?: string): Promise<any[]>;
    getWarehouseItems(warehouseId: string, settingId?: string, headerId?: string): Promise<any[]>;
    getNextNumber(fiscalYearId?: string): Promise<{
        nextNumber: number;
    }>;
    getLatestDate(fiscalYearId?: string, excludeHeaderId?: string): Promise<{
        latestDate: string | null;
        count: number;
        header: any;
    }>;
    findOne(id: number): Promise<any>;
    create(dto: CreateStocktakingTagHeaderDto): Promise<any>;
    update(id: number, dto: UpdateStocktakingTagHeaderDto): Promise<any>;
    deleteWarehouseTagsPost(headerId: string, warehouseId: string, itemIdsQuery?: string, itemIdsBody?: number[]): Promise<{
        success: boolean;
        deletedCount: number;
    } | {
        success: boolean;
        deletedCount?: undefined;
    }>;
    deleteWarehouseTags(headerId: string, warehouseId: string, itemIdsQuery?: string, itemIdsBody?: number[]): Promise<{
        success: boolean;
        deletedCount: number;
    } | {
        success: boolean;
        deletedCount?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
