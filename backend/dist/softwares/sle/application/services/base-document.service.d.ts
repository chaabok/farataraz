import { Repository } from 'typeorm';
import { SalesOrder } from '../../domain/entities/sales-order.entity';
import { SalesProformaInvoice } from '../../domain/entities/sales-proforma-invoice.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SleBaseDocumentService {
    private readonly orderRepository;
    private readonly proformaRepository;
    private readonly requestContextService;
    constructor(orderRepository: Repository<SalesOrder>, proformaRepository: Repository<SalesProformaInvoice>, requestContextService: RequestContextService);
    private getScope;
    private static readonly BASE_ELIGIBLE_STATUSES;
    getAvailableBaseDocuments(type: number): Promise<any[]>;
}
