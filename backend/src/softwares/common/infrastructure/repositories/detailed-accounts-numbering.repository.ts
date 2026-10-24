import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetailedAccountsNumbering } from '../../domain/entities/detailed-accounts-numbering.entity';
import { IDetailedAccountsNumberingRepository } from '../../domain/repositories/detailed-accounts-numbering.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class DetailedAccountsNumberingRepository implements IDetailedAccountsNumberingRepository {
  constructor(
    @InjectRepository(DetailedAccountsNumbering)
    private readonly repo: Repository<DetailedAccountsNumbering>,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async create(data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering> {
    const nextId = await this.idGenerationService.generateNextId('DetailedAccountsNumbering');
    const entity = this.repo.create({ ...data, id: nextId });
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering> {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id: id as any } }) as any;
  }

  async findAll(): Promise<DetailedAccountsNumbering[]> {
    return this.repo.find();
  }

  async findByDetailedTypeId(detailedTypesId: number): Promise<DetailedAccountsNumbering | null> {
    return this.repo.findOne({ where: { detailedTypesId: detailedTypesId as any } });
  }

  async upsert(detailedTypesId: number, data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering> {
    const existing = await this.findByDetailedTypeId(detailedTypesId);
    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({ ...data, detailedTypesId });
    }
  }

  async deleteByDetailedTypeId(detailedTypesId: number): Promise<void> {
    await this.repo.delete({ detailedTypesId: detailedTypesId as any });
  }
}
