import { IBankReconciliationRepository } from '../../domain/repositories/bank-reconciliation.repository.interface';
import { CreateBankReconciliationDto } from '../dtos/create-bank-reconciliation.dto';
import { UpdateBankReconciliationDto } from '../dtos/update-bank-reconciliation.dto';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class BankReconciliationService {
    private readonly bankReconciliationRepository;
    private readonly requestContextService;
    private readonly idGenerationService;
    constructor(bankReconciliationRepository: IBankReconciliationRepository, requestContextService: RequestContextService, idGenerationService: IdGenerationService);
    getNextNumbers(jalaliDateStr: string): Promise<{
        isDocumentNumberAuto: boolean;
        documentNumber: string;
        error: string;
    }>;
    create(createDto: CreateBankReconciliationDto): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
    findAll(): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation[]>;
    findOne(id: number): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
    update(id: number, updateDto: UpdateBankReconciliationDto): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
    remove(id: number): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
}
