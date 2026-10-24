import { ItemService } from '../../application/services/item.service';
import { CreateItemDto } from '../../application/dtos/create-item.dto';
import { UpdateItemDto } from '../../application/dtos/update-item.dto';
export declare class ItemController {
    private readonly service;
    constructor(service: ItemService);
    create(createDto: CreateItemDto): Promise<import("../../domain/entities/item.entity").Item>;
    findAll(query: any): Promise<any>;
    getDropdownItems(type?: string, warehouseId?: string, onlyActive?: string): Promise<any[]>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    getKardexActiveItems(warehouseId?: string, fromDate?: string, toDate?: string, fiscalYearId?: string, companyId?: string): Promise<any>;
    getKardexWarehouses(fiscalYearId?: string, companyId?: string): Promise<any>;
    getKardexDateBounds(fiscalYearId?: string, companyId?: string): Promise<{
        fromDate: string;
        toDate: string;
        fiscalYearId: number;
        fiscalYearTitle: string;
    }>;
    getStockSummary(id: string, warehouseId?: string, excludeVoucherId?: string, partyId?: string, currentDate?: string, docType?: string): Promise<any>;
    getItemKardex(id: string, warehouseId?: string, fromDate?: string, toDate?: string): Promise<any[]>;
    getItemTrackingFactorMovements(id: string, warehouseId?: string, fromDate?: string, toDate?: string): Promise<{
        trackingFactors: any[];
        movements: any[];
    }>;
    getSubUnits(id: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateItemDto): Promise<any>;
    remove(id: string): Promise<void>;
}
