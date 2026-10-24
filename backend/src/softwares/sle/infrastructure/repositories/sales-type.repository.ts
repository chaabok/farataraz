import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesType } from '../../domain/entities/sales-type.entity';
import { ISalesTypeRepository } from '../../domain/repositories/sales-type.repository.interface';

@Injectable()
export class SalesTypeRepository implements ISalesTypeRepository {
  constructor(
    @InjectRepository(SalesType)
    private readonly repo: Repository<SalesType>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<SalesType[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<SalesType | null> {
    return this.repo.findOne({ where: { SalesTypeID: id } as any });
  }

  async create(entity: SalesType): Promise<SalesType> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<SalesType>): Promise<SalesType> {
    await this.repo.update({ SalesTypeID: id } as any, attrs);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`SalesType with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ SalesTypeID: id } as any);
  }
}
