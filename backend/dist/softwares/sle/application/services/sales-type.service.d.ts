import { ISalesTypeRepository } from '../../domain/repositories/sales-type.repository.interface';
import { SalesType } from '../../domain/entities/sales-type.entity';
import { CreateSalesTypeDto, UpdateSalesTypeDto } from '../dtos/create-sales-type.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesTypeService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesTypeRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<SalesType[]>;
    findById(id: number): Promise<SalesType>;
    getNextCode(): Promise<{
        code: number;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    create(dto: CreateSalesTypeDto): Promise<SalesType>;
    update(id: number, dto: UpdateSalesTypeDto): Promise<SalesType>;
    remove(id: number): Promise<void>;
}
