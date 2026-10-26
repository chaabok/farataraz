import { Repository } from 'typeorm';
import { PurchaseInvoice } from '../../domain/entities/purchase-invoice.entity';
import { PurchaseInvoiceDetail } from '../../domain/entities/purchase-invoice-detail.entity';
import { PurchaseInvoiceFactor } from '../../domain/entities/purchase-invoice-factor.entity';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from '../dtos/purchase-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PurchaseInvoiceService {
    private readonly repository;
    private readonly detailRepository;
    private readonly factorRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<PurchaseInvoice>, detailRepository: Repository<PurchaseInvoiceDetail>, factorRepository: Repository<PurchaseInvoiceFactor>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private parseRef;
    create(dto: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice>;
    findAll(query?: any): Promise<PurchaseInvoice[]>;
    findOne(id: number): Promise<PurchaseInvoice>;
    update(id: number, dto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoice>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
