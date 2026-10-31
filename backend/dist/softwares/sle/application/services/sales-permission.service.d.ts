import { Repository } from 'typeorm';
import { SalesPermission } from '../../domain/entities/sales-permission.entity';
import { SalesPermissionItem } from '../../domain/entities/sales-permission-item.entity';
import { SalesPermissionFactor } from '../../domain/entities/sales-permission-factor.entity';
import { CreateSalesPermissionDto, UpdateSalesPermissionDto } from '../dtos/sales-permission.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesPermissionService {
    private readonly repository;
    private readonly itemRepository;
    private readonly factorRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesPermission>, itemRepository: Repository<SalesPermissionItem>, factorRepository: Repository<SalesPermissionFactor>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesPermissionDto): Promise<SalesPermission>;
    private saveItems;
    private saveFactors;
    findAll(query?: any): Promise<{
        items: SalesPermission[];
        total: number;
    }>;
    findOne(id: number): Promise<SalesPermission>;
    update(id: number, dto: UpdateSalesPermissionDto): Promise<SalesPermission>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
