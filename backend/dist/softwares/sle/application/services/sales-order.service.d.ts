import { Repository } from 'typeorm';
import { SalesOrder } from '../../domain/entities/sales-order.entity';
import { SalesOrderItem } from '../../domain/entities/sales-order-item.entity';
import { SalesOrderFactor } from '../../domain/entities/sales-order-factor.entity';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../dtos/sales-order.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesOrderService {
    private readonly repository;
    private readonly itemRepository;
    private readonly factorRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesOrder>, itemRepository: Repository<SalesOrderItem>, factorRepository: Repository<SalesOrderFactor>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesOrderDto): Promise<SalesOrder>;
    private saveItems;
    private saveFactors;
    findAll(query?: any): Promise<{
        items: SalesOrder[];
        total: number;
    }>;
    findOne(id: number): Promise<SalesOrder>;
    update(id: number, dto: UpdateSalesOrderDto): Promise<SalesOrder>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
