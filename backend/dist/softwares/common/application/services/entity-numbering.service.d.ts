import { IEntityNumberingRepository } from '../../domain/repositories/entity-numbering.repository.interface';
import { EntityNumbering } from '../../domain/entities/entity-numbering.entity';
import { BaseSettingsService } from './base-settings.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class EntityNumberingService {
    private readonly repo;
    private readonly baseSettingsService;
    private readonly requestContextService;
    constructor(repo: IEntityNumberingRepository, baseSettingsService: BaseSettingsService, requestContextService: RequestContextService);
    resolveTenantContext(): Promise<{
        businessStructureRef: number;
        companyRef: number | null;
    }>;
    findByEntityRef(entityRef: string): Promise<EntityNumbering | null>;
    save(entityRef: string, data: Partial<EntityNumbering>): Promise<EntityNumbering>;
    findAll(): Promise<EntityNumbering[]>;
    remove(entityRef: string): Promise<void>;
}
