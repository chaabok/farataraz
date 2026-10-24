import { SalesItemGroup } from '../../domain/entities/sales-item-group.entity';
export declare const ISalesItemGroupRepositoryToken: unique symbol;
export interface ISalesItemGroupRepository {
    manager: any;
    findAll(criteria?: any): Promise<SalesItemGroup[]>;
    findById(id: number): Promise<SalesItemGroup>;
    create(entity: Partial<SalesItemGroup>): Promise<SalesItemGroup>;
    update(id: number, entity: Partial<SalesItemGroup>): Promise<SalesItemGroup>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
