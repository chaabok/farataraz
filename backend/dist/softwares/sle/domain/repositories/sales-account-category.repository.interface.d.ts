import { SalesAccountCategory } from '../entities/sales-account-category.entity';
export declare const ISalesAccountCategoryRepositoryToken: unique symbol;
export interface ISalesAccountCategoryRepository {
    manager: any;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<SalesAccountCategory[]>;
    findById(id: number): Promise<SalesAccountCategory>;
    create(entity: Partial<SalesAccountCategory>): Promise<SalesAccountCategory>;
    update(id: number, entity: Partial<SalesAccountCategory>): Promise<SalesAccountCategory>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
