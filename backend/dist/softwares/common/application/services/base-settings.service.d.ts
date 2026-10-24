import { IBaseSettingsRepository } from '../../domain/repositories/base-settings.repository.interface';
import { UpdateBaseSettingsDto } from '../dtos/update-base-settings.dto';
export declare class BaseSettingsService {
    private readonly baseSettingsRepository;
    constructor(baseSettingsRepository: IBaseSettingsRepository);
    getSettingsByTab(tabRef: number, companyId?: number, branchId?: number, agencyId?: number): Promise<Record<string, string>>;
    saveSettings(tabRef: number, dto: UpdateBaseSettingsDto, companyId?: number, branchId?: number, agencyId?: number): Promise<void>;
}
