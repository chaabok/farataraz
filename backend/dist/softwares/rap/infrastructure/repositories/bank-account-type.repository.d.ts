import { Repository } from 'typeorm';
import { BankAccountType } from '../../domain/entities/bank-account-type.entity';
import { IBankAccountTypeRepository } from '../../domain/repositories/bank-account-type.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class BankAccountTypeRepository implements IBankAccountTypeRepository {
    private readonly repository;
    private readonly requestContextService;
    private readonly idGenService;
    constructor(repository: Repository<BankAccountType>, requestContextService: RequestContextService, idGenService: IdGenerationService);
    private getScope;
    findAll(): Promise<BankAccountType[]>;
    findById(id: number): Promise<BankAccountType | null>;
    create(entity: BankAccountType): Promise<BankAccountType>;
    update(id: number, entity: Partial<BankAccountType>): Promise<BankAccountType>;
    delete(id: number): Promise<void>;
    count(): Promise<number>;
    getMaxId(): Promise<number>;
    findAdvanced(params: any): Promise<[BankAccountType[], number]>;
}
