import { Repository } from 'typeorm';
import { WarehouseDocumentType } from '../../domain/entities/warehouse-document-type.entity';
import { IWarehouseDocumentTypeRepository } from '../../domain/repositories/warehouse-document-type.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class WarehouseDocumentTypeRepository implements IWarehouseDocumentTypeRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<WarehouseDocumentType>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<WarehouseDocumentType[]>;
    findById(id: number): Promise<WarehouseDocumentType | null>;
    create(entity: Partial<WarehouseDocumentType>): Promise<WarehouseDocumentType>;
    update(id: number, entity: Partial<WarehouseDocumentType>): Promise<WarehouseDocumentType>;
    delete(id: number): Promise<void>;
    calculateNextCode(bsId: number, companyId: number): Promise<{
        nextValue: string;
        numberingMethod: string;
        error?: string;
    }>;
}
