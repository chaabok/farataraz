import { Repository } from 'typeorm';
import { ICashRepository } from '../../domain/repositories/cash.repository.interface';
import { Cash } from '../../domain/entities/cash.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
export declare class CashRepository implements ICashRepository {
    private readonly typeOrmRepo;
    private readonly idGenService;
    private readonly requestContextService;
    private readonly baseSettingsService;
    constructor(typeOrmRepo: Repository<Cash>, idGenService: IdGenerationService, requestContextService: RequestContextService, baseSettingsService: BaseSettingsService);
    private getScope;
    create(data: Partial<Cash>): Promise<Cash>;
    update(id: number, data: Partial<Cash>): Promise<Cash>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Cash | null>;
    findAll(): Promise<Cash[]>;
    findAdvanced(params: {
        pageIndex: number;
        pageSize: number;
        sorting?: string;
        columnFilters?: string;
        globalFilter?: string;
        advancedFilters?: string;
    }): Promise<[Cash[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
