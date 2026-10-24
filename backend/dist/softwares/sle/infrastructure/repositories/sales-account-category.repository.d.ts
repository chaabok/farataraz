import { Repository } from 'typeorm';
import { SalesAccountCategory } from '../../domain/entities/sales-account-category.entity';
import { ISalesAccountCategoryRepository } from '../../domain/repositories/sales-account-category.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesAccountCategoryRepository implements ISalesAccountCategoryRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<SalesAccountCategory>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
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
