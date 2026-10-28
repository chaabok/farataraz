import { SalesTrackingFactorSetting } from '../entities/sales-tracking-factor-setting.entity';
export declare const ISalesTrackingFactorSettingRepositoryToken = "ISalesTrackingFactorSettingRepository";
export interface ISalesTrackingFactorSettingRepository {
    manager: any;
    findAll(options?: any): Promise<SalesTrackingFactorSetting[]>;
    findById(id: number): Promise<SalesTrackingFactorSetting | null>;
    findByType(type: number, businessStructureRef?: number): Promise<SalesTrackingFactorSetting | null>;
    create(entity: SalesTrackingFactorSetting): Promise<SalesTrackingFactorSetting>;
    update(id: number, attrs: Partial<SalesTrackingFactorSetting>): Promise<SalesTrackingFactorSetting>;
    delete(id: number): Promise<void>;
}
