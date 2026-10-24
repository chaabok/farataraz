import { PurchaseInvoiceService } from '../../application/services/purchase-invoice.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from '../../application/dtos/purchase-invoice.dto';
export declare class PurchaseInvoiceController {
    private readonly service;
    constructor(service: PurchaseInvoiceService);
    create(createDto: CreatePurchaseInvoiceDto): Promise<import("../../domain/entities/purchase-invoice.entity").PurchaseInvoice>;
    findAll(query: any): Promise<import("../../domain/entities/purchase-invoice.entity").PurchaseInvoice[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/purchase-invoice.entity").PurchaseInvoice>;
    update(id: string, updateDto: UpdatePurchaseInvoiceDto): Promise<import("../../domain/entities/purchase-invoice.entity").PurchaseInvoice>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
