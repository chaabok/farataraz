import { Repository } from 'typeorm';
import { SalesOrder } from '../../domain/entities/sales-order.entity';
import { SalesProformaInvoice } from '../../domain/entities/sales-proforma-invoice.entity';
import { SalesContract } from '../../domain/entities/sales-contract.entity';
import { SalesInvoice } from '../../domain/entities/sales-invoice.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SleBaseDocumentService {
    private readonly orderRepository;
    private readonly proformaRepository;
    private readonly contractRepository;
    private readonly invoiceRepository;
    private readonly requestContextService;
    constructor(orderRepository: Repository<SalesOrder>, proformaRepository: Repository<SalesProformaInvoice>, contractRepository: Repository<SalesContract>, invoiceRepository: Repository<SalesInvoice>, requestContextService: RequestContextService);
    private getScope;
    private static readonly BASE_ELIGIBLE_STATUSES;
    private getFullyCoveredOrderIds;
    getAvailableBaseDocuments(type: number, excludeProformaId?: number, customerRef?: number): Promise<any[]>;
    getBaseDocumentDate(type: number, id: number): Promise<string>;
    getBaseDocumentDetail(type: number, id: number): Promise<any>;
    private normalizeBaseDetail;
}
