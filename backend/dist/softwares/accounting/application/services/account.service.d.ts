import { Account } from '../../domain/entities/account.entity';
import { IAccountRepository } from '../../domain/repositories/account.repository.interface';
export declare class AccountService {
    private readonly accountRepository;
    constructor(accountRepository: IAccountRepository);
    create(data: Partial<Account>): Promise<Account>;
    update(id: number, data: Partial<Account>): Promise<Account>;
    private validateNatureAdjustments;
    private checkDuplicateCode;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(search?: string, level?: number, options?: any): Promise<Account[]>;
    findOne(id: number): Promise<Account>;
    remove(id: number): Promise<void>;
    seedDefaultTree(type: number, lengths: {
        group: number;
        total: number;
        specific: number;
    }): Promise<void>;
    seedData(): Promise<void>;
}
