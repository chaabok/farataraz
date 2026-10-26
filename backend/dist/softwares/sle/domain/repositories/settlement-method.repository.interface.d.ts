import { SettlementMethod } from '../entities/settlement-method.entity';
export interface ISettlementMethodRepository {
    findAll(options?: any): Promise<SettlementMethod[]>;
    findById(id: number): Promise<SettlementMethod | null>;
    create(entity: SettlementMethod): Promise<SettlementMethod>;
    update(id: number, attrs: Partial<SettlementMethod>): Promise<SettlementMethod>;
    delete(id: number): Promise<void>;
    manager: any;
}
export declare const ISettlementMethodRepositoryToken: unique symbol;
