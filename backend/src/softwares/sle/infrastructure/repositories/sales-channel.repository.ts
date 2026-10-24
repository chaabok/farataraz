import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesChannel } from '../../domain/entities/sales-channel.entity';
import { ISalesChannelRepository } from '../../domain/repositories/sales-channel.repository.interface';

@Injectable()
export class SalesChannelRepository implements ISalesChannelRepository {
  constructor(
    @InjectRepository(SalesChannel)
    private readonly repo: Repository<SalesChannel>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<SalesChannel[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<SalesChannel | null> {
    return this.repo.findOne({ where: { SalesChannelID: id } as any });
  }

  async create(entity: SalesChannel): Promise<SalesChannel> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<SalesChannel>): Promise<SalesChannel> {
    await this.repo.update(id, attrs);
    return this.findById(id) as Promise<SalesChannel>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
