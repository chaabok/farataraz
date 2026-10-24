import { WarehouseDocumentType } from '../entities/warehouse-document-type.entity';
export interface IWarehouseDocumentTypeRepository {
    manager: any;
    findAll(criteria?: any): Promise<WarehouseDocumentType[]>;
    findById(id: number): Promise<WarehouseDocumentType | null>;
    create(entity: Partial<WarehouseDocumentType>): Promise<WarehouseDocumentType>;
    update(id: number, entity: Partial<WarehouseDocumentType>): Promise<WarehouseDocumentType>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    calculateNextCode(bsId: number, companyId: number): Promise<{
        nextValue: string;
        numberingMethod: string;
        error?: string;
    }>;
}
export declare const IWarehouseDocumentTypeRepositoryToken: unique symbol;
