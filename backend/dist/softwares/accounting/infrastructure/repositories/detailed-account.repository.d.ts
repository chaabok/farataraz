import { Repository } from 'typeorm';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { IDetailedAccountRepository } from '../../domain/repositories/detailed-account.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class DetailedAccountRepository implements IDetailedAccountRepository {
    private readonly typeOrmRepo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<DetailedAccount>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<DetailedAccount>): Promise<DetailedAccount>;
    update(id: number, data: Partial<DetailedAccount>): Promise<DetailedAccount>;
    findAll(): Promise<DetailedAccount[]>;
    findWithPagination(skip: number, take: number): Promise<[DetailedAccount[], number]>;
    findAdvanced(params: any): Promise<[DetailedAccount[], number]>;
    findById(id: number): Promise<DetailedAccount | null>;
    delete(id: number): Promise<void>;
    countByDetailedTypeId(detailedTypesId: number): Promise<number>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
