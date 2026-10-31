import { SalesReturnPermissionService } from '../../application/services/sales-return-permission.service';
import { CreateSalesReturnPermissionDto, UpdateSalesReturnPermissionDto } from '../../application/dtos/sales-return-permission.dto';
export declare class SalesReturnPermissionController {
    private readonly service;
    constructor(service: SalesReturnPermissionService);
    create(createDto: CreateSalesReturnPermissionDto): Promise<import("../../domain/entities/sales-return-permission.entity").SalesReturnPermission>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/sales-return-permission.entity").SalesReturnPermission[];
        total: number;
    }>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/sales-return-permission.entity").SalesReturnPermission>;
    update(id: string, updateDto: UpdateSalesReturnPermissionDto): Promise<import("../../domain/entities/sales-return-permission.entity").SalesReturnPermission>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
