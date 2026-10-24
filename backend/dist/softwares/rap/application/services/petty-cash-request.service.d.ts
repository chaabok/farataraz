import { IPettyCashRequestRepository } from '../../domain/repositories/petty-cash-request.repository.interface';
import { CreatePettyCashRequestDto } from '../dtos/create-petty-cash-request.dto';
import { UpdatePettyCashRequestDto } from '../dtos/update-petty-cash-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';
export declare class PettyCashRequestService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    private readonly usageCheckService;
    constructor(repository: IPettyCashRequestRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService, usageCheckService: UsageCheckService);
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    create(createDto: CreatePettyCashRequestDto): Promise<any>;
    findAll(options: any): Promise<[any[], number]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateDto: UpdatePettyCashRequestDto): Promise<any>;
    remove(id: number): Promise<void>;
}
