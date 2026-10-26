import { Repository } from 'typeorm';
import { SalesItemGroup } from '../../domain/entities/sales-item-group.entity';
import { ISalesItemGroupRepository } from '../../domain/repositories/sales-item-group.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesItemGroupRepository implements ISalesItemGroupRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<SalesItemGroup>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<SalesItemGroup[]>;
    findById(id: number): Promise<SalesItemGroup>;
    create(entity: Partial<SalesItemGroup>): Promise<SalesItemGroup>;
    update(id: number, entity: Partial<SalesItemGroup>): Promise<SalesItemGroup>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
