import { SalesTypeService } from '../../application/services/sales-type.service';
import { CreateSalesTypeDto, UpdateSalesTypeDto } from '../../application/dtos/create-sales-type.dto';
export declare class SalesTypeController {
    private readonly service;
    constructor(service: SalesTypeService);
    findAll(): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-type.entity").SalesType[];
    }>;
    getNextCode(): Promise<{
        success: boolean;
        data: number;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        success: boolean;
        data: {
            isDuplicate: boolean;
        };
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-type.entity").SalesType;
    }>;
    upsert(dto: CreateSalesTypeDto & {
        SalesTypeID?: number;
    }): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-type.entity").SalesType;
    }>;
    create(dto: CreateSalesTypeDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-type.entity").SalesType;
    }>;
    update(id: string, dto: UpdateSalesTypeDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-type.entity").SalesType;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
