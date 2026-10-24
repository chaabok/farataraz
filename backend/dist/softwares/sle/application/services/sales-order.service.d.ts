import { Repository } from 'typeorm';
import { SalesOrder } from '../../domain/entities/sales-order.entity';
import { SalesOrderItem } from '../../domain/entities/sales-order-item.entity';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../dtos/sales-order.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesOrderService {
    private readonly repository;
    private readonly itemRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesOrder>, itemRepository: Repository<SalesOrderItem>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesOrderDto): Promise<SalesOrder>;
    private saveItems;
    findAll(query?: any): Promise<SalesOrder[]>;
    findOne(id: number): Promise<SalesOrder>;
    update(id: number, dto: UpdateSalesOrderDto): Promise<SalesOrder>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
