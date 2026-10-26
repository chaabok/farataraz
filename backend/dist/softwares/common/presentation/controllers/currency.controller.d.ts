import { CurrencyService } from '../../application/services/currency.service';
import { CreateCurrencyDto } from '../../application/dtos/create-currency.dto';
import { UpdateCurrencyDto } from '../../application/dtos/update-currency.dto';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    create(createCurrencyDto: CreateCurrencyDto, companyId?: string, branchId?: string, agencyId?: string): Promise<{
        data: import("../../domain/entities/currency.entity").Currency;
        message: string;
    }>;
    getNextCode(companyId?: string): Promise<{
        data: number;
    }>;
    findAll(): Promise<{
        data: import("../../domain/entities/currency.entity").Currency[];
    }>;
    findOne(id: number): Promise<{
        data: import("../../domain/entities/currency.entity").Currency;
    }>;
    update(id: number, updateCurrencyDto: UpdateCurrencyDto, companyId?: string, branchId?: string, agencyId?: string): Promise<{
        data: import("../../domain/entities/currency.entity").Currency;
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
