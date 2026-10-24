import { Repository } from 'typeorm';
import { ItemAccountCategory } from '../../domain/entities/item-account-category.entity';
import { IItemAccountCategoryRepository } from '../../domain/repositories/item-account-category.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemAccountCategoryRepository implements IItemAccountCategoryRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<ItemAccountCategory>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<ItemAccountCategory[]>;
    findById(id: number): Promise<ItemAccountCategory>;
    create(entity: Partial<ItemAccountCategory>): Promise<ItemAccountCategory>;
    update(id: number, entity: Partial<ItemAccountCategory>): Promise<ItemAccountCategory>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
