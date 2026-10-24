import { BaseSettings } from '../entities/base-settings.entity';
export interface IBaseSettingsRepository {
    findByTabRef(tabRef: number, companyId?: number, branchId?: number, agencyId?: number): Promise<BaseSettings[]>;
    saveSetting(tabRef: number, key: string, value: string, companyId?: number, branchId?: number, agencyId?: number): Promise<BaseSettings>;
    saveSettings(tabRef: number, settings: {
        key: string;
        value: string;
    }[], companyId?: number, branchId?: number, agencyId?: number): Promise<void>;
}
