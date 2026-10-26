import { IReconcileBankStatementRepository } from '../../domain/repositories/reconcile-bank-statement.repository.interface';
import { CreateReconcileBankStatementDto } from '../dtos/create-reconcile-bank-statement.dto';
import { UpdateReconcileBankStatementDto } from '../dtos/update-reconcile-bank-statement.dto';
import { ReconcileBankStatement } from '../../domain/entities/reconcile-bank-statement.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { FiscalYearService } from '../../../common/application/services/fiscal-year.service';
import { BankAccountService } from './bank-account.service';
export declare class ReconcileBankStatementService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContext;
    private readonly baseSettingsService;
    private readonly fiscalYearService;
    private readonly bankAccountService;
    constructor(repository: IReconcileBankStatementRepository, idGenerationService: IdGenerationService, requestContext: RequestContextService, baseSettingsService: BaseSettingsService, fiscalYearService: FiscalYearService, bankAccountService: BankAccountService);
    findAll(): Promise<ReconcileBankStatement[]>;
    findOne(id: number): Promise<ReconcileBankStatement>;
    getSuggestedDates(bankAccountRef: number): Promise<{
        fromDate: string;
        previousBalance: number;
    }>;
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    create(dto: CreateReconcileBankStatementDto): Promise<ReconcileBankStatement>;
    update(id: number, dto: UpdateReconcileBankStatementDto): Promise<ReconcileBankStatement>;
    remove(id: number): Promise<void>;
}
