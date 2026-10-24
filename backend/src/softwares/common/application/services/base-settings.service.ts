import { Inject, Injectable } from '@nestjs/common';
import { IBaseSettingsRepository } from '../../domain/repositories/base-settings.repository.interface';
import { BaseSettings } from '../../domain/entities/base-settings.entity';
import { UpdateBaseSettingsDto } from '../dtos/update-base-settings.dto';

@Injectable()
export class BaseSettingsService {
  constructor(
    @Inject('IBaseSettingsRepository')
    private readonly baseSettingsRepository: IBaseSettingsRepository,
  ) {}

  async getSettingsByTab(tabRef: number, companyId: number = 2, branchId?: number, agencyId?: number): Promise<Record<string, string>> {
    const settings = await this.baseSettingsRepository.findByTabRef(tabRef, companyId, branchId, agencyId);
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      // keys might have spaces since it's nchar(50), better to trim
      result[s.key.trim()] = s.value;
    });

    if (tabRef === 1) {
      // Flawlessly merge tab 7 (Holding Management) settings into general settings lookup,
      // but only if they do not exist already in TabRef 1 to allow changes in TabRef 1 to take precedence.
      try {
        const holdingSettings = await this.baseSettingsRepository.findByTabRef(7, companyId, branchId, agencyId);
        holdingSettings.forEach((s) => {
          const key = s.key.trim();
          if (result[key] === undefined) {
            result[key] = s.value;
          }
        });
      } catch (e) {
        console.error('Error fetching tab 7 settings inside tab 1 merger:', e);
      }
    }

    return result;
  }

  async saveSettings(tabRef: number, dto: UpdateBaseSettingsDto, companyId: number = 2, branchId?: number, agencyId?: number): Promise<void> {
    await this.baseSettingsRepository.saveSettings(tabRef, dto.settings, companyId, branchId, agencyId);
    if (tabRef === 1 && dto.settings) {
      const holdingKeys = ['shareHeadquarterData', 'activeBusinessStructures'];
      const holdingSettings = dto.settings.filter(s => holdingKeys.includes(s.key.trim()));
      if (holdingSettings.length > 0) {
        await this.baseSettingsRepository.saveSettings(7, holdingSettings, companyId, branchId, agencyId);
      }
    }
  }
}
