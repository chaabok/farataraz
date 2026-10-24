import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Currency } from './currency.entity';
export declare class CurrencyExchangeRate extends AppBaseEntity {
    currencyExchangeRateId: number;
    baseCurrencyRef: number;
    baseCurrencyEntity?: Currency;
    targetCurrencyRef: number;
    targetCurrencyEntity?: Currency;
    effectiveDate: string;
    exchangeRate: number;
}
