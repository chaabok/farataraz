import { Repository } from 'typeorm';
import { BaseSettings } from '../../domain/entities/base-settings.entity';
import { IBaseSettingsRepository } from '../../domain/repositories/base-settings.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class BaseSettingsRepository implements IBaseSettingsRepository {
    private readonly repository;
    private readonly idGenerationService;
    constructor(repository: Repository<BaseSettings>, idGenerationService: IdGenerationService);
    findByTabRef(tabRef: number, companyId?: number, branchId?: number, agencyId?: number): Promise<BaseSettings[]>;
    saveSetting(tabRef: number, key: string, value: string, companyId?: number, branchId?: number, agencyId?: number): Promise<BaseSettings>;
    saveSettings(tabRef: number, settings: {
        key: string;
        value: string;
    }[], companyId?: number, branchId?: number, agencyId?: number): Promise<void>;
}
