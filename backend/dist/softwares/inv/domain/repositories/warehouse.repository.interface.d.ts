import { Warehouse } from '../entities/warehouse.entity';
export interface IWarehouseRepository {
    findAll(businessStructureRef: number, companyRef: number): Promise<Warehouse[]>;
    findById(id: number, businessStructureRef: number, companyRef: number): Promise<Warehouse | null>;
    create(data: Partial<Warehouse>): Promise<Warehouse>;
    update(id: number, data: Partial<Warehouse>): Promise<Warehouse>;
    remove(id: number): Promise<void>;
    countChildren(parentId: number): Promise<number>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    checkDuplicate(field: 'WarehouseCode' | 'WarehouseTitle' | 'WarehouseTitle2', value: string, businessStructureRef: number, companyRef: number, excludeId?: number): Promise<boolean>;
}
export declare const IWarehouseRepositoryToken: unique symbol;
