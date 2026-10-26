import { Repository, EntityManager } from 'typeorm';
import { ItemServiceGroup } from '../../domain/entities/item-service-group.entity';
import { IItemServiceGroupRepository } from '../../domain/repositories/item-service-group.repository.interface';
export declare class ItemServiceGroupRepository implements IItemServiceGroupRepository {
    private readonly repo;
    constructor(repo: Repository<ItemServiceGroup>);
    get manager(): EntityManager;
    findAll(options?: any): Promise<ItemServiceGroup[]>;
    findById(id: number): Promise<ItemServiceGroup | null>;
    count(options?: any): Promise<number>;
    create(entity: Partial<ItemServiceGroup>): Promise<ItemServiceGroup>;
    update(id: number, entity: Partial<ItemServiceGroup>): Promise<ItemServiceGroup>;
    delete(id: number): Promise<void>;
}
