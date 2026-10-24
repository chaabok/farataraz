import { ItemAccountCategory } from '../../domain/entities/item-account-category.entity';
export declare const IItemAccountCategoryRepositoryToken: unique symbol;
export interface IItemAccountCategoryRepository {
    manager: any;
    findAll(criteria?: any): Promise<ItemAccountCategory[]>;
    findById(id: number): Promise<ItemAccountCategory>;
    create(entity: Partial<ItemAccountCategory>): Promise<ItemAccountCategory>;
    update(id: number, entity: Partial<ItemAccountCategory>): Promise<ItemAccountCategory>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
