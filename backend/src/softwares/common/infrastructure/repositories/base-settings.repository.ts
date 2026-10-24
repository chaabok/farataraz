import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BaseSettings } from '../../domain/entities/base-settings.entity';
import { IBaseSettingsRepository } from '../../domain/repositories/base-settings.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class BaseSettingsRepository implements IBaseSettingsRepository {
  constructor(
    @InjectRepository(BaseSettings)
    private readonly repository: Repository<BaseSettings>,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async findByTabRef(tabRef: number, companyId: number = 2, branchId?: number, agencyId?: number): Promise<BaseSettings[]> {
    const where: any = { tabRef, businessStructureRef: companyId, companyRef: companyId };
    where.branchRef = branchId === undefined ? IsNull() : branchId;
    where.agencyRef = agencyId === undefined ? IsNull() : agencyId;
    return this.repository.find({ where });
  }

  async saveSetting(tabRef: number, key: string, value: string, companyId: number = 2, branchId?: number, agencyId?: number): Promise<BaseSettings> {
    const where: any = { tabRef, key, businessStructureRef: companyId, companyRef: companyId };
    where.branchRef = branchId === undefined ? IsNull() : branchId;
    where.agencyRef = agencyId === undefined ? IsNull() : agencyId;
    let setting = await this.repository.findOne({ where });
    
    const strVal = value !== undefined && value !== null ? String(value) : '';

    if (setting) {
      setting.value = strVal;
    } else {
      const id = await this.idGenerationService.generateNextId('BaseSettings');
      const createData: Partial<BaseSettings> = { baseSettingsID: id, tabRef, key, value: strVal, businessStructureRef: companyId, companyRef: companyId };
      createData.branchRef = branchId === undefined ? null : branchId;
      createData.agencyRef = agencyId === undefined ? null : agencyId;
      setting = this.repository.create(createData);
    }
    
    return this.repository.save(setting);
  }

  async saveSettings(tabRef: number, settings: { key: string; value: string }[], companyId: number = 2, branchId?: number, agencyId?: number): Promise<void> {
    const where: any = { tabRef, businessStructureRef: companyId, companyRef: companyId };
    where.branchRef = branchId === undefined ? IsNull() : branchId;
    where.agencyRef = agencyId === undefined ? IsNull() : agencyId;
    const existingSettings = await this.repository.find({ where });

    const entitiesToSave: BaseSettings[] = [];
    
    for (const settingData of settings) {
      const strKey = String(settingData.key || '').trim();
      if (!strKey) continue;
      const strVal = settingData.value !== undefined && settingData.value !== null ? String(settingData.value) : '';

      const existing = existingSettings.find(s => s.key.trim() === strKey);
      if (existing) {
        existing.value = strVal;
        if (!entitiesToSave.includes(existing)) {
          entitiesToSave.push(existing);
        }
      } else {
        const id = await this.idGenerationService.generateNextId('BaseSettings');
        const createData: Partial<BaseSettings> = {
          baseSettingsID: id,
          tabRef,
          key: strKey,
          value: strVal,
          businessStructureRef: companyId,
          companyRef: companyId,
        };
        createData.branchRef = branchId === undefined ? null : branchId;
        createData.agencyRef = agencyId === undefined ? null : agencyId;
        const newSetting = this.repository.create(createData);
        existingSettings.push(newSetting);
        entitiesToSave.push(newSetting);
      }
    }
    
    if (entitiesToSave.length > 0) {
      await this.repository.save(entitiesToSave);
    }
  }
}
