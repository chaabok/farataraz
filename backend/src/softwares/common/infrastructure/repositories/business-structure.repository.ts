import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessStructure } from '../../domain/entities/business-structure.entity';
import { IBusinessStructureRepository } from '../../domain/repositories/business-structure.repository.interface';

@Injectable()
export class BusinessStructureRepository implements IBusinessStructureRepository {
  constructor(
    @InjectRepository(BusinessStructure)
    public readonly repo: Repository<BusinessStructure>,
  ) {}

  async create(businessStructure: Partial<BusinessStructure>): Promise<BusinessStructure> {
    const newRecord = this.repo.create(businessStructure);
    return this.repo.save(newRecord);
  }

  async findAll(): Promise<BusinessStructure[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<BusinessStructure | null> {
    return this.repo.findOne({ where: { businessStructureId: id } });
  }

  async update(id: number, businessStructure: Partial<BusinessStructure>): Promise<BusinessStructure> {
    await this.repo.update({ businessStructureId: id }, businessStructure);
    return this.repo.findOne({ where: { businessStructureId: id } }) as Promise<BusinessStructure>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ businessStructureId: id });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async updateAllSharing(isShared: boolean): Promise<void> {
    await this.repo.manager.query(
      `UPDATE "Gnr"."BusinessStructure" SET "IsBasicInfoShared" = $1 WHERE "BusinessStructureID" > 0`,
      [isShared]
    );
  }
}
