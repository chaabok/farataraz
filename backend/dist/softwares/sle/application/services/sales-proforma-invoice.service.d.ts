import { Repository } from 'typeorm';
import { SalesProformaInvoice } from '../../domain/entities/sales-proforma-invoice.entity';
import { SalesProformaInvoiceItem } from '../../domain/entities/sales-proforma-invoice-item.entity';
import { SalesProformaInvoiceFactor } from '../../domain/entities/sales-proforma-invoice-factor.entity';
import { CreateSalesProformaInvoiceDto, UpdateSalesProformaInvoiceDto } from '../dtos/sales-proforma-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesProformaInvoiceService {
    private readonly repository;
    private readonly itemRepository;
    private readonly factorRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesProformaInvoice>, itemRepository: Repository<SalesProformaInvoiceItem>, factorRepository: Repository<SalesProformaInvoiceFactor>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesProformaInvoiceDto): Promise<SalesProformaInvoice>;
    private saveItems;
    private saveFactors;
    findAll(query?: any): Promise<{
        items: SalesProformaInvoice[];
        total: number;
    }>;
    findOne(id: number): Promise<SalesProformaInvoice>;
    update(id: number, dto: UpdateSalesProformaInvoiceDto): Promise<SalesProformaInvoice>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
