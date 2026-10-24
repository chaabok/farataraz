import { Repository } from 'typeorm';
import { TemporaryItemReceipt } from '../../domain/entities/temporary-item-receipt.entity';
import { TemporaryItemReceiptDetail } from '../../domain/entities/temporary-item-receipt-detail.entity';
import { TemporaryItemReceiptFactor } from '../../domain/entities/temporary-item-receipt-factor.entity';
import { TemporaryItemReceiptTrackingFactor } from '../../domain/entities/temporary-item-receipt-tracking-factor.entity';
import { CreateTemporaryItemReceiptDto, UpdateTemporaryItemReceiptDto } from '../dtos/temporary-item-receipt.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class TemporaryItemReceiptService {
    private readonly repository;
    private readonly detailRepository;
    private readonly factorRepository;
    private readonly tfRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<TemporaryItemReceipt>, detailRepository: Repository<TemporaryItemReceiptDetail>, factorRepository: Repository<TemporaryItemReceiptFactor>, tfRepository: Repository<TemporaryItemReceiptTrackingFactor>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(type?: number): Promise<{
        documentNumber: number;
    }>;
    private parseRef;
    private saveTrackingFactorsForDetail;
    create(dto: CreateTemporaryItemReceiptDto): Promise<TemporaryItemReceipt>;
    findAll(query?: any): Promise<TemporaryItemReceipt[]>;
    findOne(id: number): Promise<TemporaryItemReceipt>;
    update(id: number, dto: UpdateTemporaryItemReceiptDto): Promise<TemporaryItemReceipt>;
    remove(id: number): Promise<void>;
}
