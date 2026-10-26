import { Repository } from 'typeorm';
import { StocktakingSetting } from '../../domain/entities/stocktaking-setting.entity';
import { StocktakingSettingWarehouse } from '../../domain/entities/stocktaking-setting-warehouse.entity';
import { CreateStocktakingSettingDto } from '../dtos/stocktaking-setting.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class StocktakingSettingService {
    private readonly settingRepo;
    private readonly settingWarehouseRepo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(settingRepo: Repository<StocktakingSetting>, settingWarehouseRepo: Repository<StocktakingSettingWarehouse>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getAllSettings(): Promise<any[]>;
    getCurrentSetting(): Promise<any>;
    saveSetting(dto: CreateStocktakingSettingDto): Promise<StocktakingSetting>;
    deleteSetting(id: number): Promise<{
        success: boolean;
    }>;
}
