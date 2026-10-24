import { Repository } from 'typeorm';
import { PettyCashSummary } from '../../domain/entities/petty-cash-summary.entity';
import { IPettyCashSummaryRepository } from '../../domain/repositories/petty-cash-summary.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PettyCashSummaryRepository implements IPettyCashSummaryRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<PettyCashSummary>, requestContextService: RequestContextService);
    private getScope;
    private getBuilder;
    findAll(options: any): Promise<[PettyCashSummary[], number]>;
    findById(id: number): Promise<PettyCashSummary | null>;
    create(entity: PettyCashSummary): Promise<PettyCashSummary>;
    update(id: number, entity: Partial<PettyCashSummary>): Promise<PettyCashSummary>;
    delete(id: number): Promise<void>;
    isUsed(id: number): Promise<boolean>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
