import { BaseSettingsService } from '../../application/services/base-settings.service';
import { BusinessStructureService } from '../../application/services/business-structure.service';
import { UpdateBaseSettingsDto } from '../../application/dtos/update-base-settings.dto';
export declare class BaseSettingsController {
    private readonly baseSettingsService;
    private readonly businessStructureService;
    constructor(baseSettingsService: BaseSettingsService, businessStructureService: BusinessStructureService);
    getSettings(tabRef: number, companyId?: string, branchId?: string, agencyId?: string): Promise<{
        data: Record<string, string>;
    }>;
    updateSettings(tabRef: number, dto: UpdateBaseSettingsDto, companyId?: string, branchId?: string, agencyId?: string): Promise<{
        message: string;
    }>;
}
