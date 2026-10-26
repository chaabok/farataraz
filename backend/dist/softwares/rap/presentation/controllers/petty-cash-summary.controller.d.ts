import { PettyCashSummaryService } from '../../application/services/petty-cash-summary.service';
import { CreatePettyCashSummaryDto } from '../../application/dtos/create-petty-cash-summary.dto';
import { UpdatePettyCashSummaryDto } from '../../application/dtos/update-petty-cash-summary.dto';
export declare class PettyCashSummaryController {
    private readonly service;
    constructor(service: PettyCashSummaryService);
    findAll(query: any): Promise<{
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
            items: import("../../domain/entities/petty-cash-summary-item.entity").PettyCashSummaryItem[];
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
    getNextNumbers(date: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/petty-cash-summary.entity").PettyCashSummary>;
    create(createDto: CreatePettyCashSummaryDto): Promise<import("../../domain/entities/petty-cash-summary.entity").PettyCashSummary>;
    isUsed(id: string): Promise<boolean>;
    update(id: string, updateDto: UpdatePettyCashSummaryDto): Promise<import("../../domain/entities/petty-cash-summary.entity").PettyCashSummary>;
    remove(id: string): Promise<void>;
}
