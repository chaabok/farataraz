import { ICurrencyRepository } from '../../domain/repositories/currency.repository.interface';
import { CreateCurrencyDto } from '../dtos/create-currency.dto';
import { UpdateCurrencyDto } from '../dtos/update-currency.dto';
import { Currency } from '../../domain/entities/currency.entity';
export declare class CurrencyService {
    private readonly repository;
    constructor(repository: ICurrencyRepository);
    create(dto: CreateCurrencyDto, businessStructureRef?: number, branchRef?: number, agencyRef?: number): Promise<Currency>;
    findAll(): Promise<Currency[]>;
    findOne(id: number): Promise<Currency>;
    update(id: number, dto: UpdateCurrencyDto, businessStructureRef?: number, branchRef?: number, agencyRef?: number): Promise<Currency>;
    remove(id: number): Promise<void>;
    getNextCode(businessStructureRef?: number): Promise<number>;
    seedForBusinessStructure(businessStructureId: number): Promise<void>;
}
