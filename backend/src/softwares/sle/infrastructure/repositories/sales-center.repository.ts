import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesCenter } from '../../domain/entities/sales-center.entity';
import { ISalesCenterRepository } from '../../domain/repositories/sales-center.repository.interface';

@Injectable()
export class SalesCenterRepository implements ISalesCenterRepository {
  constructor(
    @InjectRepository(SalesCenter)
    private readonly repo: Repository<SalesCenter>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<SalesCenter[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<SalesCenter | null> {
    return this.repo.findOne({ where: { SalesCenterID: id } as any });
  }

  async create(entity: SalesCenter): Promise<SalesCenter> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<SalesCenter>): Promise<SalesCenter> {
    await this.repo.update(id, attrs);
    return this.findById(id) as Promise<SalesCenter>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
