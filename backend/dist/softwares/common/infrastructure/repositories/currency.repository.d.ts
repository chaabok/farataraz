import { Repository } from 'typeorm';
import { Currency } from '../../domain/entities/currency.entity';
import { ICurrencyRepository } from '../../domain/repositories/currency.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class CurrencyRepository implements ICurrencyRepository {
    private readonly typeOrmRepo;
    private readonly requestContextService;
    private readonly idGenService;
    constructor(typeOrmRepo: Repository<Currency>, requestContextService: RequestContextService, idGenService: IdGenerationService);
    private getScope;
    create(currency: Currency): Promise<Currency>;
    update(id: number, currency: Partial<Currency>): Promise<Currency>;
    findById(id: number): Promise<Currency | null>;
    findAll(): Promise<Currency[]>;
    delete(id: number): Promise<void>;
    getMaxCode(businessStructureRef: number): Promise<number>;
    findByTitle(title: string, businessStructureRef: number): Promise<Currency | null>;
    findByTitleEn(titleEn: string, businessStructureRef: number): Promise<Currency | null>;
    findByCode(code: number, businessStructureRef: number): Promise<Currency | null>;
}
