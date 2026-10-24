import { ItemServiceGroup } from '../entities/item-service-group.entity';
export declare const IItemServiceGroupRepositoryToken = "IItemServiceGroupRepositoryToken";
export interface IItemServiceGroupRepository {
    findAll(options?: any): Promise<ItemServiceGroup[]>;
    findById(id: number): Promise<ItemServiceGroup | null>;
    count(options?: any): Promise<number>;
    create(entity: Partial<ItemServiceGroup>): Promise<ItemServiceGroup>;
    update(id: number, entity: Partial<ItemServiceGroup>): Promise<ItemServiceGroup>;
    delete(id: number): Promise<void>;
    manager: any;
}
