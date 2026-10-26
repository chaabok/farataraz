import { Repository } from 'typeorm';
import { Account } from '../../domain/entities/account.entity';
import { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class AccountRepository implements IAccountRepository {
    private readonly typeOrmRepo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<Account>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<Account>): Promise<Account>;
    update(id: number, data: Partial<Account>): Promise<Account>;
    findAll(search?: string, level?: number, options?: any): Promise<Account[]>;
    findById(id: number): Promise<Account | null>;
    findByCode(code: string): Promise<Account | null>;
    findByTitle(title: string): Promise<Account | null>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    delete(id: number): Promise<void>;
    getGroupAccountLength(): Promise<number>;
}
