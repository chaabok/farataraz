import { SalesPermissionService } from '../../application/services/sales-permission.service';
import { CreateSalesPermissionDto, UpdateSalesPermissionDto } from '../../application/dtos/sales-permission.dto';
export declare class SalesPermissionController {
    private readonly service;
    constructor(service: SalesPermissionService);
    create(createDto: CreateSalesPermissionDto): Promise<import("../../domain/entities/sales-permission.entity").SalesPermission>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/sales-permission.entity").SalesPermission[];
        total: number;
    }>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/sales-permission.entity").SalesPermission>;
    update(id: string, updateDto: UpdateSalesPermissionDto): Promise<import("../../domain/entities/sales-permission.entity").SalesPermission>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
