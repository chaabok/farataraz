import { IPaidDocumentClearingRepository } from '../../domain/repositories/paid-document-clearing.repository.interface';
import { CreatePaidDocumentClearingDto } from '../dtos/create-paid-document-clearing.dto';
import { UpdatePaidDocumentClearingDto } from '../dtos/update-paid-document-clearing.dto';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { DocumentAccountingInfoService } from './document-accounting-info.service';
import { PaidDocumentClearing } from '../../domain/entities/paid-document-clearing.entity';
export declare class PaidDocumentClearingService {
    private readonly repo;
    private readonly requestContext;
    private readonly idGenService;
    private readonly documentAccountingInfoService;
    constructor(repo: IPaidDocumentClearingRepository, requestContext: RequestContextService, idGenService: IdGenerationService, documentAccountingInfoService: DocumentAccountingInfoService);
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    create(dto: CreatePaidDocumentClearingDto): Promise<PaidDocumentClearing>;
    update(id: number, dto: UpdatePaidDocumentClearingDto): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<PaidDocumentClearing>;
    findAll(filters: any): Promise<[PaidDocumentClearing[], number]>;
}
