import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StocktakingSetting } from '../../domain/entities/stocktaking-setting.entity';
import { StocktakingSettingWarehouse } from '../../domain/entities/stocktaking-setting-warehouse.entity';
import { CreateStocktakingSettingDto, UpdateStocktakingSettingDto } from '../dtos/stocktaking-setting.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class StocktakingSettingService {
  constructor(
    @InjectRepository(StocktakingSetting)
    private readonly settingRepo: Repository<StocktakingSetting>,
    @InjectRepository(StocktakingSettingWarehouse)
    private readonly settingWarehouseRepo: Repository<StocktakingSettingWarehouse>,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    return { bsId, compId };
  }

  async getAllSettings(): Promise<any[]> {
    const { bsId, compId } = await this.getScope();

    let settings = await this.settingRepo.find({
      where: {
        companyRef: compId,
        businessStructureRef: bsId,
      },
      relations: ['warehouses'],
      order: { StocktakingSettingID: 'DESC' },
    });

    if (!settings || settings.length === 0) {
      const current = await this.getCurrentSetting();
      if (current) {
        settings = [current as StocktakingSetting];
      }
    }

    return (settings || []).map((s) => ({
      ...s,
      id: s.StocktakingSettingID,
      code: s.StocktakingSettingID,
      title: s.MethodName,
    }));
  }

  async getCurrentSetting(): Promise<any> {
    const { bsId, compId } = await this.getScope();

    let setting = await this.settingRepo.findOne({
      where: {
        companyRef: compId,
        businessStructureRef: bsId,
      },
      relations: ['warehouses'],
      order: { StocktakingSettingID: 'DESC' },
    });

    if (!setting) {
      const settingId = await this.idGenerationService.generateNextIdBlock('StocktakingSetting', 1);
      setting = this.settingRepo.create({
        StocktakingSettingID: settingId,
        MethodName: 'روش انبارگردانی',
        CountTimes: 1,
        CountWithTrackingFactors: false,
        Count1MinQty: 0,
        Count1MinRial: 0,
        Count1MinTurnover: 0,
        Count2ListType: 'all_first',
        Count2DiscrepancyPercent: 0,
        Count3CombineType: 'OR',
        Count3DiscrepancyPercent: 0,
        Count3Discrepancy1And2: false,
        Count3Discrepancy1AndInv: false,
        Count3Discrepancy2AndInv: false,
        businessStructureRef: bsId,
        companyRef: compId,
        warehouses: [],
      });
      await this.settingRepo.save(setting);
    }

    return {
      ...setting,
      id: setting.StocktakingSettingID,
      code: setting.StocktakingSettingID,
      title: setting.MethodName,
    };
  }

  async saveSetting(dto: CreateStocktakingSettingDto): Promise<StocktakingSetting> {
    if (!dto.MethodName || !dto.MethodName.trim()) {
      throw new BadRequestException('عنوان روش انبارگردانی الزامی است.');
    }

    if (!dto.warehouseIds || !Array.isArray(dto.warehouseIds) || dto.warehouseIds.length === 0) {
      throw new BadRequestException('انتخاب حداقل یک انبار برای روش انبارگردانی الزامی است.');
    }

    const { bsId, compId } = await this.getScope();

    let existing: StocktakingSetting | null = null;
    if (dto.StocktakingSettingID) {
      existing = await this.settingRepo.findOne({
        where: { StocktakingSettingID: dto.StocktakingSettingID },
        relations: ['warehouses'],
      });
    }

    let settingId: number;

    if (!existing) {
      settingId = await this.idGenerationService.generateNextIdBlock('StocktakingSetting', 1);
      existing = this.settingRepo.create({
        StocktakingSettingID: settingId,
        businessStructureRef: bsId,
        companyRef: compId,
      });
    } else {
      settingId = Number(existing.StocktakingSettingID);
    }

    existing.MethodName = dto.MethodName || 'روش انبارگردانی';
    existing.CountTimes = Number(dto.CountTimes || 1);
    existing.CountWithTrackingFactors = Boolean(dto.CountWithTrackingFactors);
    existing.Count1MinQty = Number(dto.Count1MinQty || 0);
    existing.Count1MinRial = Number(dto.Count1MinRial || 0);
    existing.Count1MinTurnover = Number(dto.Count1MinTurnover || 0);
    existing.Count2ListType = dto.Count2ListType || 'all_first';
    existing.Count2DiscrepancyPercent = Number(dto.Count2DiscrepancyPercent || 0);
    existing.Count3CombineType = dto.Count3CombineType || 'OR';
    existing.Count3DiscrepancyPercent = Number(dto.Count3DiscrepancyPercent || 0);
    existing.Count3Discrepancy1And2 = Boolean(dto.Count3Discrepancy1And2);
    existing.Count3Discrepancy1AndInv = Boolean(dto.Count3Discrepancy1AndInv);
    existing.Count3Discrepancy2AndInv = Boolean(dto.Count3Discrepancy2AndInv);
    existing.lastModifier = this.requestContextService.getUserId() || 1;

    const savedSetting = await this.settingRepo.save(existing);

    // Sync warehouses
    if (dto.warehouseIds && Array.isArray(dto.warehouseIds)) {
      await this.settingWarehouseRepo.delete({ StocktakingSettingRef: settingId });

      if (dto.warehouseIds.length > 0) {
        const startWhId = await this.idGenerationService.generateNextIdBlock(
          'StocktakingSettingWarehouse',
          dto.warehouseIds.length,
        );

        const whRecords = dto.warehouseIds.map((wId, idx) =>
          this.settingWarehouseRepo.create({
            StocktakingSettingWarehouseID: startWhId + idx,
            StocktakingSettingRef: settingId,
            WarehouseRef: Number(wId),
          }),
        );

        await this.settingWarehouseRepo.save(whRecords);
      }
    }

    return this.settingRepo.findOne({
      where: { StocktakingSettingID: settingId },
      relations: ['warehouses'],
    }) as Promise<StocktakingSetting>;
  }

  async deleteSetting(id: number): Promise<{ success: boolean }> {
    if (id && Number(id) > 0) {
      await this.settingWarehouseRepo.delete({ StocktakingSettingRef: Number(id) });
      await this.settingRepo.delete({ StocktakingSettingID: Number(id) });
    }
    return { success: true };
  }
}
