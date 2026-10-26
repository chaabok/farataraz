import { Currency } from '../entities/currency.entity';
export interface ICurrencyRepository {
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
