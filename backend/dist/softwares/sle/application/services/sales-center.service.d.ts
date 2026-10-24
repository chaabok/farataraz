import { ISalesCenterRepository } from '../../domain/repositories/sales-center.repository.interface';
import { SalesCenter } from '../../domain/entities/sales-center.entity';
import { CreateSalesCenterDto, UpdateSalesCenterDto } from '../dtos/create-sales-center.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesCenterService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesCenterRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<SalesCenter[]>;
    findById(id: number): Promise<SalesCenter>;
    getNextNumber(): Promise<{
        documentNumber: number;
        isDocumentNumberAuto: boolean;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    create(dto: CreateSalesCenterDto): Promise<SalesCenter>;
    update(id: number, dto: UpdateSalesCenterDto): Promise<SalesCenter>;
    remove(id: number): Promise<void>;
}
