import { Repository } from 'typeorm';
import { SalesReturnPermission } from '../../domain/entities/sales-return-permission.entity';
import { SalesReturnPermissionItem } from '../../domain/entities/sales-return-permission-item.entity';
import { SalesReturnPermissionFactor } from '../../domain/entities/sales-return-permission-factor.entity';
import { CreateSalesReturnPermissionDto, UpdateSalesReturnPermissionDto } from '../dtos/sales-return-permission.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesReturnPermissionService {
    private readonly repository;
    private readonly itemRepository;
    private readonly factorRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesReturnPermission>, itemRepository: Repository<SalesReturnPermissionItem>, factorRepository: Repository<SalesReturnPermissionFactor>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesReturnPermissionDto): Promise<SalesReturnPermission>;
    private saveItems;
    private saveFactors;
    findAll(query?: any): Promise<{
        items: SalesReturnPermission[];
        total: number;
    }>;
    findOne(id: number): Promise<SalesReturnPermission>;
    update(id: number, dto: UpdateSalesReturnPermissionDto): Promise<SalesReturnPermission>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
