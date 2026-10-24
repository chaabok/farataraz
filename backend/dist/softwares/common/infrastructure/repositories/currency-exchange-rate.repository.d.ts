import { Repository } from 'typeorm';
import { CurrencyExchangeRate } from '../../domain/entities/currency-exchange-rate.entity';
import { ICurrencyExchangeRateRepository } from '../../domain/repositories/currency-exchange-rate.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class CurrencyExchangeRateRepository implements ICurrencyExchangeRateRepository {
    private readonly repo;
    private readonly idGenService;
    constructor(repo: Repository<CurrencyExchangeRate>, idGenService: IdGenerationService);
    private isBasicShared;
    findAll(businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate[]>;
    findById(id: number, businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate | null>;
    create(entity: CurrencyExchangeRate): Promise<CurrencyExchangeRate>;
    update(entity: CurrencyExchangeRate): Promise<CurrencyExchangeRate>;
    delete(id: number): Promise<void>;
}
