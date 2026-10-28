import { Repository } from 'typeorm';
import { SalesTrackingFactorSetting } from '../../domain/entities/sales-tracking-factor-setting.entity';
import { ISalesTrackingFactorSettingRepository } from '../../domain/repositories/sales-tracking-factor-setting.repository.interface';
export declare class SalesTrackingFactorSettingRepository implements ISalesTrackingFactorSettingRepository {
    private readonly repo;
    constructor(repo: Repository<SalesTrackingFactorSetting>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<SalesTrackingFactorSetting[]>;
    findById(id: number): Promise<SalesTrackingFactorSetting | null>;
    findByType(type: number, businessStructureRef?: number): Promise<SalesTrackingFactorSetting | null>;
    create(entity: SalesTrackingFactorSetting): Promise<SalesTrackingFactorSetting>;
    update(id: number, attrs: Partial<SalesTrackingFactorSetting>): Promise<SalesTrackingFactorSetting>;
    delete(id: number): Promise<void>;
}
