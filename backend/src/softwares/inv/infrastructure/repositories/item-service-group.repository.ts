import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ItemServiceGroup } from '../../domain/entities/item-service-group.entity';
import { IItemServiceGroupRepository } from '../../domain/repositories/item-service-group.repository.interface';

@Injectable()
export class ItemServiceGroupRepository implements IItemServiceGroupRepository {
  constructor(
    @InjectRepository(ItemServiceGroup)
    private readonly repo: Repository<ItemServiceGroup>,
  ) {}

  get manager(): EntityManager {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<ItemServiceGroup[]> {
    return this.repo.find({
      relations: ['fields', 'relatedProducts', 'children'],
      ...options,
    });
  }

  async findById(id: number): Promise<ItemServiceGroup | null> {
    return this.repo.findOne({
      where: { ItemServiceGroupID: id },
      relations: ['fields', 'relatedProducts', 'children', 'parent'],
    });
  }

  async count(options?: any): Promise<number> {
    return this.repo.count(options);
  }

  async create(entity: Partial<ItemServiceGroup>): Promise<ItemServiceGroup> {
    const newEntity = this.repo.create(entity);
    return this.repo.save(newEntity);
  }

  async update(id: number, entity: Partial<ItemServiceGroup>): Promise<ItemServiceGroup> {
    await this.repo.update(id, entity);
    const updated = await this.findById(id);
    if (!updated) throw new Error('ItemServiceGroup not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
