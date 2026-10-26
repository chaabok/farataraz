import { Item } from '../entities/item.entity';
export declare const IItemRepositoryToken: unique symbol;
export interface IItemRepository {
    manager: any;
    findAll(criteria?: any): Promise<Item[]>;
    findById(id: number): Promise<Item>;
    create(entity: Partial<Item>): Promise<Item>;
    update(id: number, entity: Partial<Item>): Promise<Item>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
