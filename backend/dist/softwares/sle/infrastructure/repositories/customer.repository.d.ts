import { Repository } from 'typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
export declare class CustomerRepository implements ICustomerRepository {
    private readonly repo;
    constructor(repo: Repository<Customer>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<Customer[]>;
    findById(id: number): Promise<Customer | null>;
    create(entity: Customer): Promise<Customer>;
    update(id: number, attrs: Partial<Customer>): Promise<Customer>;
    delete(id: number): Promise<void>;
}
