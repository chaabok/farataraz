import { CustomerGroup } from '../entities/customer-group.entity';

export interface ICustomerGroupRepository {
  findAll(options?: any): Promise<CustomerGroup[]>;
  findById(id: number): Promise<CustomerGroup | null>;
  create(entity: Partial<CustomerGroup>): Promise<CustomerGroup>;
  update(id: number, entity: Partial<CustomerGroup>): Promise<CustomerGroup>;
  delete(id: number): Promise<void>;
  manager: any;
}

export const ICustomerGroupRepositoryToken = 'ICustomerGroupRepositoryToken';
