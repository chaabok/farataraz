import { CurrencyExchangeRate } from '../entities/currency-exchange-rate.entity';
export interface ICurrencyExchangeRateRepository {
    findAll(businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate[]>;
    findById(id: number, businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate | null>;
    create(entity: CurrencyExchangeRate): Promise<CurrencyExchangeRate>;
    update(entity: CurrencyExchangeRate): Promise<CurrencyExchangeRate>;
    delete(id: number): Promise<void>;
}
