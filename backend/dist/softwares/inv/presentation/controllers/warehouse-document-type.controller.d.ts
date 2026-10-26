import { WarehouseDocumentTypeService } from '../../application/services/warehouse-document-type.service';
import { CreateWarehouseDocumentTypeDto } from '../../application/dtos/create-warehouse-document-type.dto';
import { UpdateWarehouseDocumentTypeDto } from '../../application/dtos/update-warehouse-document-type.dto';
export declare class WarehouseDocumentTypeController {
    private readonly service;
    constructor(service: WarehouseDocumentTypeService);
    create(createDto: CreateWarehouseDocumentTypeDto): Promise<import("../../domain/entities/warehouse-document-type.entity").WarehouseDocumentType>;
    findAll(query: any): Promise<any>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/warehouse-document-type.entity").WarehouseDocumentType>;
    update(id: string, updateDto: UpdateWarehouseDocumentTypeDto): Promise<import("../../domain/entities/warehouse-document-type.entity").WarehouseDocumentType>;
    remove(id: string): Promise<void>;
}
