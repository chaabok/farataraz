import { Repository } from 'typeorm';
import { SalesInvoice } from '../../domain/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../../domain/entities/sales-invoice-item.entity';
import { SalesInvoiceFactor } from '../../domain/entities/sales-invoice-factor.entity';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../dtos/sales-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesInvoiceService {
    private readonly repository;
    private readonly itemRepository;
    private readonly factorRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesInvoice>, itemRepository: Repository<SalesInvoiceItem>, factorRepository: Repository<SalesInvoiceFactor>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesInvoiceDto): Promise<SalesInvoice>;
    private saveItems;
    private saveFactors;
    findAll(query?: any): Promise<{
        items: SalesInvoice[];
        total: number;
    }>;
    findOne(id: number): Promise<SalesInvoice>;
    update(id: number, dto: UpdateSalesInvoiceDto): Promise<SalesInvoice>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
