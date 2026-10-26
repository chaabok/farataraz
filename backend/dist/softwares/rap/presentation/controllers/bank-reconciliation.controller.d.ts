import { BankReconciliationService } from '../../application/services/bank-reconciliation.service';
import { CreateBankReconciliationDto } from '../../application/dtos/create-bank-reconciliation.dto';
import { UpdateBankReconciliationDto } from '../../application/dtos/update-bank-reconciliation.dto';
export declare class BankReconciliationController {
    private readonly bankReconciliationService;
    constructor(bankReconciliationService: BankReconciliationService);
    create(createDto: CreateBankReconciliationDto): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
    findAll(): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation[]>;
    getNextNumbers(date: string): Promise<{
        isDocumentNumberAuto: boolean;
        documentNumber: string;
        error: string;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
    update(id: string, updateDto: UpdateBankReconciliationDto): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
    remove(id: string): Promise<import("../../domain/entities/bank-reconciliation.entity").BankReconciliation>;
}
