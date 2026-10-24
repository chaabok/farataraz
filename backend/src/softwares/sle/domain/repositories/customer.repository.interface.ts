import { Customer } from '../entities/customer.entity';

export const ICustomerRepositoryToken = 'ICustomerRepository';

export interface ICustomerRepository {
  manager: any;
  findAll(options?: any): Promise<Customer[]>;
  findById(id: number): Promise<Customer | null>;
  create(entity: Customer): Promise<Customer>;
  update(id: number, attrs: Partial<Customer>): Promise<Customer>;
  delete(id: number): Promise<void>;
}
