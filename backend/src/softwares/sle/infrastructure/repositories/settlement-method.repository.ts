import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettlementMethod } from '../../domain/entities/settlement-method.entity';
import { ISettlementMethodRepository } from '../../domain/repositories/settlement-method.repository.interface';

@Injectable()
export class SettlementMethodRepository implements ISettlementMethodRepository {
  constructor(
    @InjectRepository(SettlementMethod)
    private readonly repo: Repository<SettlementMethod>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<SettlementMethod[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<SettlementMethod | null> {
    return this.repo.findOne({ where: { SettlementMethodID: id } as any });
  }

  async create(entity: SettlementMethod): Promise<SettlementMethod> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<SettlementMethod>): Promise<SettlementMethod> {
    await this.repo.update(id, attrs);
    return this.findById(id) as Promise<SettlementMethod>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
