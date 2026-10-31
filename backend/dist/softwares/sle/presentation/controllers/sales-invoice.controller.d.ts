import { SalesInvoiceService } from '../../application/services/sales-invoice.service';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../../application/dtos/sales-invoice.dto';
export declare class SalesInvoiceController {
    private readonly service;
    constructor(service: SalesInvoiceService);
    create(createDto: CreateSalesInvoiceDto): Promise<import("../../domain/entities/sales-invoice.entity").SalesInvoice>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/sales-invoice.entity").SalesInvoice[];
        total: number;
    }>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/sales-invoice.entity").SalesInvoice>;
    update(id: string, updateDto: UpdateSalesInvoiceDto): Promise<import("../../domain/entities/sales-invoice.entity").SalesInvoice>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
