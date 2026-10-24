import { Repository } from 'typeorm';
import { WarehouseReceipt } from '../../domain/entities/warehouse-receipt.entity';
import { WarehouseReceiptDetail } from '../../domain/entities/warehouse-receipt-detail.entity';
import { WarehouseReceiptFactor } from '../../domain/entities/warehouse-receipt-factor.entity';
import { WarehouseIssueTrackingFactor } from '../../domain/entities/warehouse-issue-tracking-factor.entity';
import { WarehouseReceiptTrackingFactor } from '../../domain/entities/warehouse-receipt-tracking-factor.entity';
import { WarehouseVouchersPricing } from '../../domain/entities/warehouse-vouchers-pricing.entity';
import { CreateWarehouseReceiptDto, UpdateWarehouseReceiptDto } from '../dtos/warehouse-receipt.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class WarehouseReceiptService {
    private readonly repository;
    private readonly detailRepository;
    private readonly factorRepository;
    private readonly issueTfRepository;
    private readonly receiptTfRepository;
    private readonly pricingRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<WarehouseReceipt>, detailRepository: Repository<WarehouseReceiptDetail>, factorRepository: Repository<WarehouseReceiptFactor>, issueTfRepository: Repository<WarehouseIssueTrackingFactor>, receiptTfRepository: Repository<WarehouseReceiptTrackingFactor>, pricingRepository: Repository<WarehouseVouchersPricing>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private parseRef;
    private saveTrackingFactorsBatch;
    private saveTrackingFactorsForDetail;
    create(dto: CreateWarehouseReceiptDto): Promise<WarehouseReceipt>;
    findAll(query?: any): Promise<WarehouseReceipt[]>;
    findOne(id: number): Promise<WarehouseReceipt>;
    update(id: number, dto: UpdateWarehouseReceiptDto): Promise<WarehouseReceipt>;
    remove(id: number): Promise<void>;
    getRegisteredTrackingFactors(itemRef?: number, warehouseRef?: number, itemCode?: string): Promise<any[]>;
    priceReceiptItems(dto: {
        pricingMethod: 'standardRate' | 'lastPurchase' | 'lastConsumption';
        ReceiptDate?: any;
        WarehouseReceiptID?: number;
        items: {
            RowNo?: number;
            ItemRef?: any;
            ItemCode?: any;
            ItemName?: string;
            Quantity?: number;
            UnitPrice?: number;
        }[];
    }): Promise<{
        success: boolean;
        method: 'standardRate' | 'lastPurchase' | 'lastConsumption';
        methodTitle: string;
        totalItems: number;
        pricedItemsCount: number;
        unpricedItemsCount: number;
        items: {
            rowNo: number;
            itemRef: number;
            itemCode: string;
            itemName: string;
            oldUnitPrice: number;
            newUnitPrice: number;
            isPriced: boolean;
            statusMessage: string;
            effectiveDate?: string;
            receiptDate?: string;
            sourceDocumentNumber?: string;
        }[];
    }>;
}
