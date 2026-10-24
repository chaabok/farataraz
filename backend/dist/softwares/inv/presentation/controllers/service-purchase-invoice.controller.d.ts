import { ServicePurchaseInvoiceService } from '../../application/services/service-purchase-invoice.service';
import { CreateServicePurchaseInvoiceDto, UpdateServicePurchaseInvoiceDto } from '../../application/dtos/service-purchase-invoice.dto';
export declare class ServicePurchaseInvoiceController {
    private readonly service;
    constructor(service: ServicePurchaseInvoiceService);
    create(createDto: CreateServicePurchaseInvoiceDto): Promise<import("../../domain/entities/service-purchase-invoice.entity").ServicePurchaseInvoice>;
    findAll(query: any): Promise<import("../../domain/entities/service-purchase-invoice.entity").ServicePurchaseInvoice[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/service-purchase-invoice.entity").ServicePurchaseInvoice>;
    update(id: string, updateDto: UpdateServicePurchaseInvoiceDto): Promise<import("../../domain/entities/service-purchase-invoice.entity").ServicePurchaseInvoice>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
