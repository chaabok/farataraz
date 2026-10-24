import { WarehouseService } from '../../application/services/warehouse.service';
import { CreateWarehouseDto } from '../../application/dtos/create-warehouse.dto';
import { UpdateWarehouseDto } from '../../application/dtos/update-warehouse.dto';
export declare class WarehouseController {
    private readonly service;
    constructor(service: WarehouseService);
    findAll(businessStructureId?: string, companyId?: string): Promise<import("../../domain/entities/warehouse.entity").Warehouse[]>;
    getNextNumber(businessStructureId?: string, companyId?: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    findById(id: string, businessStructureId?: string, companyId?: string): Promise<import("../../domain/entities/warehouse.entity").Warehouse>;
    create(createDto: CreateWarehouseDto, req: any, businessStructureId?: string, companyId?: string): Promise<import("../../domain/entities/warehouse.entity").Warehouse>;
    update(id: string, updateDto: UpdateWarehouseDto, req: any, businessStructureId?: string, companyId?: string): Promise<import("../../domain/entities/warehouse.entity").Warehouse>;
    remove(id: string, businessStructureId?: string, companyId?: string): Promise<void>;
}
