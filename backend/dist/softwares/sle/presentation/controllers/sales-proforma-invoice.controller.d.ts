import { SalesProformaInvoiceService } from '../../application/services/sales-proforma-invoice.service';
import { CreateSalesProformaInvoiceDto, UpdateSalesProformaInvoiceDto } from '../../application/dtos/sales-proforma-invoice.dto';
export declare class SalesProformaInvoiceController {
    private readonly service;
    constructor(service: SalesProformaInvoiceService);
    create(createDto: CreateSalesProformaInvoiceDto): Promise<import("../../domain/entities/sales-proforma-invoice.entity").SalesProformaInvoice>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/sales-proforma-invoice.entity").SalesProformaInvoice[];
        total: number;
    }>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/sales-proforma-invoice.entity").SalesProformaInvoice>;
    update(id: string, updateDto: UpdateSalesProformaInvoiceDto): Promise<import("../../domain/entities/sales-proforma-invoice.entity").SalesProformaInvoice>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
