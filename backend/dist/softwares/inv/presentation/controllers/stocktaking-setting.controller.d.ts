import { StocktakingSettingService } from '../../application/services/stocktaking-setting.service';
import { CreateStocktakingSettingDto } from '../../application/dtos/stocktaking-setting.dto';
export declare class StocktakingSettingController {
    private readonly service;
    constructor(service: StocktakingSettingService);
    getSetting(): Promise<any[]>;
    saveSetting(dto: CreateStocktakingSettingDto): Promise<import("../../domain/entities/stocktaking-setting.entity").StocktakingSetting>;
    updateSetting(id: string, dto: CreateStocktakingSettingDto): Promise<import("../../domain/entities/stocktaking-setting.entity").StocktakingSetting>;
    deleteSetting(id: string): Promise<{
        success: boolean;
    }>;
}
