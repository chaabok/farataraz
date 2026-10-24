import { Repository } from 'typeorm';
import { CustomerGroup } from '../../domain/entities/customer-group.entity';
import { ICustomerGroupRepository } from '../../domain/repositories/customer-group.repository.interface';
export declare class CustomerGroupRepository implements ICustomerGroupRepository {
    private readonly repo;
    constructor(repo: Repository<CustomerGroup>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<CustomerGroup[]>;
    findById(id: number): Promise<CustomerGroup | null>;
    create(entity: Partial<CustomerGroup>): Promise<CustomerGroup>;
    update(id: number, entity: Partial<CustomerGroup>): Promise<CustomerGroup>;
    delete(id: number): Promise<void>;
}
