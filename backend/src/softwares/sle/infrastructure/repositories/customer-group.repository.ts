import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerGroup } from '../../domain/entities/customer-group.entity';
import { ICustomerGroupRepository } from '../../domain/repositories/customer-group.repository.interface';

@Injectable()
export class CustomerGroupRepository implements ICustomerGroupRepository {
  constructor(
    @InjectRepository(CustomerGroup)
    private readonly repo: Repository<CustomerGroup>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<CustomerGroup[]> {
    return this.repo.find({
      relations: ['detailedAccount', 'parent'],
      ...options,
    });
  }

  async findById(id: number): Promise<CustomerGroup | null> {
    return this.repo.findOne({
      where: { CustomerGroupID: id } as any,
      relations: ['detailedAccount', 'parent'],
    });
  }

  async create(entity: Partial<CustomerGroup>): Promise<CustomerGroup> {
    const created = this.repo.create(entity);
    return this.repo.save(created);
  }

  async update(id: number, entity: Partial<CustomerGroup>): Promise<CustomerGroup> {
    await this.repo.update(id, entity as any);
    const updated = await this.findById(id);
    if (!updated) throw new Error(`CustomerGroup with ID ${id} not found after update`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
