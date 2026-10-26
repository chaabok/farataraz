import { Repository } from 'typeorm';
import { StocktakingTagHeader } from '../../domain/entities/stocktaking-tag-header.entity';
import { StocktakingTagDetail } from '../../domain/entities/stocktaking-tag-detail.entity';
import { StocktakingTag } from '../../domain/entities/stocktaking-tag.entity';
import { StocktakingSettingWarehouse } from '../../domain/entities/stocktaking-setting-warehouse.entity';
import { ItemPhysicalLocation } from '../../domain/entities/item-physical-location.entity';
import { Item } from '../../domain/entities/item.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { CreateStocktakingTagHeaderDto, UpdateStocktakingTagHeaderDto } from '../dtos/stocktaking-tag.dto';
export declare class StocktakingTagService {
    private readonly headerRepo;
    private readonly detailRepo;
    private readonly tagRepo;
    private readonly settingWhRepo;
    private readonly itemLocationRepo;
    private readonly itemRepo;
    private readonly warehouseRepo;
    private readonly idGenService;
    constructor(headerRepo: Repository<StocktakingTagHeader>, detailRepo: Repository<StocktakingTagDetail>, tagRepo: Repository<StocktakingTag>, settingWhRepo: Repository<StocktakingSettingWarehouse>, itemLocationRepo: Repository<ItemPhysicalLocation>, itemRepo: Repository<Item>, warehouseRepo: Repository<Warehouse>, idGenService: IdGenerationService);
    findAll(): Promise<any[]>;
    getNextHeaderNumber(fiscalYearId?: number): Promise<{
        nextNumber: number;
    }>;
    normalizeDate(dStr: any): string;
    getLatestStocktaking(fiscalYearId?: number, excludeHeaderId?: number): Promise<{
        latestDate: string | null;
        count: number;
        header: any;
    }>;
    findOne(id: number, manager?: any): Promise<any>;
    getWarehousesForSetting(settingId?: number, headerId?: number): Promise<any[]>;
    getWarehouseItems(warehouseId: number, settingId?: number, headerId?: number): Promise<any[]>;
    private parseBigIntSafe;
    private extractValidDetails;
    create(dto: CreateStocktakingTagHeaderDto): Promise<any>;
    update(id: number, dto: UpdateStocktakingTagHeaderDto): Promise<any>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    deleteWarehouseTags(headerId: number, warehouseId: number, itemIds?: number[]): Promise<{
        success: boolean;
        deletedCount: number;
    } | {
        success: boolean;
        deletedCount?: undefined;
    }>;
}
