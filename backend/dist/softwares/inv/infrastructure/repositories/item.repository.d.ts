import { Repository } from 'typeorm';
import { Item } from '../../domain/entities/item.entity';
import { IItemRepository } from '../../domain/repositories/item.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemRepository implements IItemRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<Item>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<Item[]>;
    findById(id: number): Promise<Item>;
    create(entity: Partial<Item>): Promise<Item>;
    update(id: number, entity: Partial<Item>): Promise<Item>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
