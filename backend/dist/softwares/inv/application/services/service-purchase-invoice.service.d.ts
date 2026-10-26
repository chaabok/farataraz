import { Repository } from 'typeorm';
import { ServicePurchaseInvoice } from '../../domain/entities/service-purchase-invoice.entity';
import { ServicePurchaseInvoiceDetail } from '../../domain/entities/service-purchase-invoice-detail.entity';
import { ServicePurchaseInvoiceFactor } from '../../domain/entities/service-purchase-invoice-factor.entity';
import { CreateServicePurchaseInvoiceDto, UpdateServicePurchaseInvoiceDto } from '../dtos/service-purchase-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ServicePurchaseInvoiceService {
    private readonly repository;
    private readonly detailRepository;
    private readonly factorRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ServicePurchaseInvoice>, detailRepository: Repository<ServicePurchaseInvoiceDetail>, factorRepository: Repository<ServicePurchaseInvoiceFactor>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private parseRef;
    create(dto: CreateServicePurchaseInvoiceDto): Promise<ServicePurchaseInvoice>;
    findAll(query?: any): Promise<ServicePurchaseInvoice[]>;
    findOne(id: number): Promise<ServicePurchaseInvoice>;
    update(id: number, dto: UpdateServicePurchaseInvoiceDto): Promise<ServicePurchaseInvoice>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
