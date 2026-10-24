import { SalesOrderService } from '../../application/services/sales-order.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../../application/dtos/sales-order.dto';
export declare class SalesOrderController {
    private readonly service;
    constructor(service: SalesOrderService);
    create(createDto: CreateSalesOrderDto): Promise<import("../../domain/entities/sales-order.entity").SalesOrder>;
    findAll(query: any): Promise<import("../../domain/entities/sales-order.entity").SalesOrder[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/sales-order.entity").SalesOrder>;
    update(id: string, updateDto: UpdateSalesOrderDto): Promise<import("../../domain/entities/sales-order.entity").SalesOrder>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
