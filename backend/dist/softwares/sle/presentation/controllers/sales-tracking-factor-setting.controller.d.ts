import { SalesTrackingFactorSettingService } from '../../application/services/sales-tracking-factor-setting.service';
import { UpsertSalesTrackingFactorSettingsDto } from '../../application/dtos/create-sales-tracking-factor-setting.dto';
export declare class SalesTrackingFactorSettingController {
    private readonly service;
    constructor(service: SalesTrackingFactorSettingService);
    getSettings(): Promise<{
        success: boolean;
        data: import("../../application/services/sales-tracking-factor-setting.service").SalesTrackingFactorSettingView[];
    }>;
    upsert(dto: UpsertSalesTrackingFactorSettingsDto): Promise<{
        success: boolean;
        data: import("../../application/services/sales-tracking-factor-setting.service").SalesTrackingFactorSettingView[];
    }>;
}
