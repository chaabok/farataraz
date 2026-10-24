import { IStandardItemRateRepository } from '../../domain/repositories/standard-item-rate.repository.interface';
import { CreateStandardItemRateDto } from '../dtos/create-standard-item-rate.dto';
import { UpdateStandardItemRateDto } from '../dtos/update-standard-item-rate.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class StandardItemRateService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IStandardItemRateRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private ensureTables;
    private getScope;
    findAll(query: any): Promise<any>;
    getItemsByCategory(categoryId?: number | null, rateId?: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    validateEffectiveDate(categoryId: number, effectiveDate: string, excludeId?: number): Promise<{
        valid: boolean;
        message?: string;
        maxEffectiveDate?: string;
    }>;
    create(createDto: CreateStandardItemRateDto): Promise<any>;
    update(id: number, updateDto: UpdateStandardItemRateDto): Promise<any>;
    remove(id: number): Promise<void>;
}
