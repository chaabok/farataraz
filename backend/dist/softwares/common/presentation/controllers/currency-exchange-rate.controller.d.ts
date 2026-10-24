import { CurrencyExchangeRateService } from '../../application/services/currency-exchange-rate.service';
import { CreateCurrencyExchangeRateDto } from '../../application/dtos/create-currency-exchange-rate.dto';
import { UpdateCurrencyExchangeRateDto } from '../../application/dtos/update-currency-exchange-rate.dto';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class CurrencyExchangeRateController {
    private readonly service;
    private readonly requestContext;
    constructor(service: CurrencyExchangeRateService, requestContext: RequestContextService);
    findAll(): Promise<import("../../domain/entities/currency-exchange-rate.entity").CurrencyExchangeRate[]>;
    findOne(id: number): Promise<import("../../domain/entities/currency-exchange-rate.entity").CurrencyExchangeRate>;
    create(dto: CreateCurrencyExchangeRateDto): Promise<import("../../domain/entities/currency-exchange-rate.entity").CurrencyExchangeRate>;
    update(id: number, dto: UpdateCurrencyExchangeRateDto): Promise<import("../../domain/entities/currency-exchange-rate.entity").CurrencyExchangeRate>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
