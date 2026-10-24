import { CurrencyExchangeRate } from '../../domain/entities/currency-exchange-rate.entity';
import { ICurrencyExchangeRateRepository } from '../../domain/repositories/currency-exchange-rate.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { CreateCurrencyExchangeRateDto } from '../dtos/create-currency-exchange-rate.dto';
import { UpdateCurrencyExchangeRateDto } from '../dtos/update-currency-exchange-rate.dto';
export declare class CurrencyExchangeRateService {
    private readonly repo;
    private readonly idGenService;
    constructor(repo: ICurrencyExchangeRateRepository, idGenService: IdGenerationService);
    findAll(businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate[]>;
    findById(id: number, businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate>;
    create(dto: CreateCurrencyExchangeRateDto, businessStructureRef: number, companyRef: number, userId: number): Promise<CurrencyExchangeRate>;
    update(id: number, dto: UpdateCurrencyExchangeRateDto, businessStructureRef: number, companyRef: number, userId: number): Promise<CurrencyExchangeRate>;
    delete(id: number, businessStructureRef: number, companyRef?: number): Promise<void>;
}
