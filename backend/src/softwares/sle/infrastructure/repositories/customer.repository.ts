import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<Customer[]> {
    return this.repo.find({
      relations: ['party', 'customerGroup', 'salesIntermediary', 'currency'],
      ...options,
    });
  }

  async findById(id: number): Promise<Customer | null> {
    return this.repo.findOne({
      where: { CustomerID: id } as any,
      relations: ['party', 'customerGroup', 'salesIntermediary', 'currency'],
    });
  }

  async create(entity: Customer): Promise<Customer> {
    const saved = await this.repo.save(entity);
    return this.findById(saved.CustomerID) as Promise<Customer>;
  }

  async update(id: number, attrs: Partial<Customer>): Promise<Customer> {
    await this.repo.update({ CustomerID: id } as any, attrs);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Customer with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ CustomerID: id } as any);
  }
}
