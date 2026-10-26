import { WarehouseReceiptService } from '../../application/services/warehouse-receipt.service';
import { CreateWarehouseReceiptDto, UpdateWarehouseReceiptDto, PriceReceiptItemsDto } from '../../application/dtos/warehouse-receipt.dto';
export declare class WarehouseReceiptController {
    private readonly service;
    constructor(service: WarehouseReceiptService);
    priceItems(dto: PriceReceiptItemsDto): Promise<{
        success: boolean;
        method: "standardRate" | "lastPurchase" | "lastConsumption";
        methodTitle: string;
        totalItems: number;
        pricedItemsCount: number;
        unpricedItemsCount: number;
        items: {
            rowNo: number;
            itemRef: number;
            itemCode: string;
            itemName: string;
            oldUnitPrice: number;
            newUnitPrice: number;
            isPriced: boolean;
            statusMessage: string;
            effectiveDate?: string;
            receiptDate?: string;
            sourceDocumentNumber?: string;
        }[];
    }>;
    create(createDto: CreateWarehouseReceiptDto): Promise<import("../../domain/entities/warehouse-receipt.entity").WarehouseReceipt>;
    findAll(query: any, req: any): Promise<import("../../domain/entities/warehouse-receipt.entity").WarehouseReceipt[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    getRegisteredTrackingFactors(itemRef?: string, warehouseRef?: string, itemCode?: string): Promise<any[]>;
    findOne(id: string): Promise<import("../../domain/entities/warehouse-receipt.entity").WarehouseReceipt>;
    update(id: string, updateDto: UpdateWarehouseReceiptDto): Promise<import("../../domain/entities/warehouse-receipt.entity").WarehouseReceipt>;
    remove(id: string): Promise<void>;
}
