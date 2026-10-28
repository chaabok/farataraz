import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTrackingFactorSetting } from '../../domain/entities/sales-tracking-factor-setting.entity';
import { ISalesTrackingFactorSettingRepository } from '../../domain/repositories/sales-tracking-factor-setting.repository.interface';

@Injectable()
export class SalesTrackingFactorSettingRepository implements ISalesTrackingFactorSettingRepository {
  constructor(
    @InjectRepository(SalesTrackingFactorSetting)
    private readonly repo: Repository<SalesTrackingFactorSetting>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<SalesTrackingFactorSetting[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<SalesTrackingFactorSetting | null> {
    return this.repo.findOne({ where: { SalesTrackingFactorSettingID: id } as any });
  }

  async findByType(type: number, businessStructureRef?: number): Promise<SalesTrackingFactorSetting | null> {
    const where: any = { SalesDocumentType: type };
    if (businessStructureRef) {
      where.BusinessStructureRef = businessStructureRef;
    }
    return this.repo.findOne({ where });
  }

  async create(entity: SalesTrackingFactorSetting): Promise<SalesTrackingFactorSetting> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<SalesTrackingFactorSetting>): Promise<SalesTrackingFactorSetting> {
    await this.repo.update({ SalesTrackingFactorSettingID: id } as any, attrs);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`SalesTrackingFactorSetting with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ SalesTrackingFactorSettingID: id } as any);
  }
}
