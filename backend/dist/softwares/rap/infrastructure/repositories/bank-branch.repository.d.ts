import { Repository } from 'typeorm';
import { BankBranch } from '../../domain/entities/bank-branch.entity';
import { IBankBranchRepository } from '../../domain/repositories/bank-branch.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
export declare class BankBranchRepository implements IBankBranchRepository {
    private readonly typeOrmRepo;
    private readonly idGenService;
    private readonly requestContextService;
    private readonly baseSettingsService;
    constructor(typeOrmRepo: Repository<BankBranch>, idGenService: IdGenerationService, requestContextService: RequestContextService, baseSettingsService: BaseSettingsService);
    private getScope;
    create(data: Partial<BankBranch>): Promise<BankBranch>;
    update(id: number, data: Partial<BankBranch>): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<BankBranch | null>;
    findAll(): Promise<BankBranch[]>;
    findAdvanced(params: any): Promise<[BankBranch[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
