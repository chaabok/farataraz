import { DataSource } from 'typeorm';
import { IPettyCashSummaryRepository } from '../../domain/repositories/petty-cash-summary.repository.interface';
import { CreatePettyCashSummaryDto } from '../dtos/create-petty-cash-summary.dto';
import { UpdatePettyCashSummaryDto } from '../dtos/update-petty-cash-summary.dto';
import { PettyCashSummary } from '../../domain/entities/petty-cash-summary.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { PettyCashSummaryItem } from '../../domain/entities/petty-cash-summary-item.entity';
export declare class PettyCashSummaryService {
    private readonly repository;
    private readonly requestContextService;
    private readonly idGenerationService;
    private readonly dataSource;
    constructor(repository: IPettyCashSummaryRepository, requestContextService: RequestContextService, idGenerationService: IdGenerationService, dataSource: DataSource);
    findAll(options: any): Promise<{
        items: {
            pettyCashName: string;
            currentBalance: number;
            totalAmount: number;
            pettyCashSummaryId: number;
            pettyCashRef: number;
            pettyCash: import("../../domain/entities/petty-cash.entity").PettyCash;
            number: number;
            date: Date;
            description: string;
            fiscalYearRef: number;
            state: import("../../domain/entities/petty-cash-summary.enum").PettyCashSummaryState;
            voucherHeaderRef: number | null;
            voucherHeader?: import("../../../accounting/domain/entities/voucher.entity").Voucher;
            items: PettyCashSummaryItem[];
            version: number;
            creator: number;
            creationDate: Date;
            createTime: string;
            lastModifier: number;
            lastModificationDate: Date;
            lastModificationTime: string;
            businessStructureRef: number;
            businessStructureEntity?: any;
            companyRef?: number;
            companyEntity?: any;
            branchRef?: number;
            branchEntity?: any;
            agencyRef?: number;
            agencyEntity?: any;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<PettyCashSummary>;
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    create(createDto: CreatePettyCashSummaryDto): Promise<PettyCashSummary>;
    update(id: number, updateDto: UpdatePettyCashSummaryDto): Promise<PettyCashSummary>;
    remove(id: number): Promise<void>;
    isUsed(id: number): Promise<boolean>;
}
