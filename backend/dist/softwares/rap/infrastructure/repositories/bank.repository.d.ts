import { Repository } from 'typeorm';
import { Bank } from '../../domain/entities/bank.entity';
import { IBankRepository } from '../../domain/repositories/bank.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
export declare class BankRepository implements IBankRepository {
    private readonly typeOrmRepo;
    private readonly idGenService;
    private readonly requestContextService;
    private readonly baseSettingsService;
    constructor(typeOrmRepo: Repository<Bank>, idGenService: IdGenerationService, requestContextService: RequestContextService, baseSettingsService: BaseSettingsService);
    private getScope;
    create(data: Partial<Bank>): Promise<Bank>;
    update(id: number, data: Partial<Bank>): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Bank | null>;
    findAll(): Promise<Bank[]>;
    findAdvanced(params: any): Promise<[Bank[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
