import { ReconcileBankStatementService } from '../../application/services/reconcile-bank-statement.service';
import { CreateReconcileBankStatementDto } from '../../application/dtos/create-reconcile-bank-statement.dto';
import { UpdateReconcileBankStatementDto } from '../../application/dtos/update-reconcile-bank-statement.dto';
export declare class ReconcileBankStatementController {
    private readonly service;
    constructor(service: ReconcileBankStatementService);
    findAll(): Promise<import("../../domain/entities/reconcile-bank-statement.entity").ReconcileBankStatement[]>;
    getNextNumbers(date: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    getSuggestedDates(bankAccountRef: number): Promise<{
        fromDate: string;
        previousBalance: number;
    }>;
    findOne(id: number): Promise<import("../../domain/entities/reconcile-bank-statement.entity").ReconcileBankStatement>;
    create(dto: CreateReconcileBankStatementDto): Promise<import("../../domain/entities/reconcile-bank-statement.entity").ReconcileBankStatement>;
    update(id: number, dto: UpdateReconcileBankStatementDto): Promise<import("../../domain/entities/reconcile-bank-statement.entity").ReconcileBankStatement>;
    remove(id: number): Promise<void>;
}
