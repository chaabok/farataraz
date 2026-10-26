import { Repository } from 'typeorm';
import { BankAccount } from '../../domain/entities/bank-account.entity';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
export declare class BankAccountRepository implements IBankAccountRepository {
    private readonly repository;
    private readonly requestContextService;
    private readonly idGenService;
    private readonly baseSettingsService;
    constructor(repository: Repository<BankAccount>, requestContextService: RequestContextService, idGenService: IdGenerationService, baseSettingsService: BaseSettingsService);
    private getScope;
    private getBuilder;
    create(bankAccount: BankAccount): Promise<BankAccount>;
    update(bankAccountId: number, bankAccount: Partial<BankAccount>): Promise<BankAccount>;
    delete(bankAccountId: number): Promise<void>;
    findById(bankAccountId: number): Promise<BankAccount | null>;
    findAll(options?: any): Promise<{
        items: BankAccount[];
        total: number;
    }>;
}
