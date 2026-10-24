import { SalesCenterService } from '../../application/services/sales-center.service';
import { CreateSalesCenterDto, UpdateSalesCenterDto } from '../../application/dtos/create-sales-center.dto';
export declare class SalesCenterController {
    private readonly service;
    constructor(service: SalesCenterService);
    findAll(): Promise<{
        data: import("../../domain/entities/sales-center.entity").SalesCenter[];
        success: boolean;
    }>;
    getNextNumber(): Promise<{
        data: {
            documentNumber: number;
            isDocumentNumberAuto: boolean;
        };
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        data: {
            isDuplicate: boolean;
        };
        success: boolean;
    }>;
    create(dto: CreateSalesCenterDto): Promise<{
        data: import("../../domain/entities/sales-center.entity").SalesCenter;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateSalesCenterDto): Promise<{
        data: import("../../domain/entities/sales-center.entity").SalesCenter;
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/sales-center.entity").SalesCenter;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
