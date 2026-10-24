import { PurchaseSalesParameter } from '../entities/purchase-sales-parameter.entity';
export interface IPurchaseSalesParameterRepository {
    manager: any;
    findAll(criteria?: any): Promise<PurchaseSalesParameter[]>;
    findById(id: number): Promise<PurchaseSalesParameter | null>;
    create(entity: Partial<PurchaseSalesParameter>): Promise<PurchaseSalesParameter>;
    update(id: number, entity: Partial<PurchaseSalesParameter>): Promise<PurchaseSalesParameter>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
export declare const IPurchaseSalesParameterRepositoryToken: unique symbol;
