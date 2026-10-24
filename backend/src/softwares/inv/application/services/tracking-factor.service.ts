import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITrackingFactorRepository, ITrackingFactorRepositoryToken } from '../../domain/repositories/tracking-factor.repository.interface';
import { TrackingFactor } from '../../domain/entities/tracking-factor.entity';
import { TrackingFactorItemRelated } from '../../domain/entities/tracking-factor-item-related.entity';
import { TrackingFactorConstantValue } from '../../domain/entities/tracking-factor-constant-value.entity';
import { Item } from '../../domain/entities/item.entity';
import { CreateTrackingFactorDto, UpdateTrackingFactorDto } from '../dtos/tracking-factor.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

function containsDecimal(val?: string | null): boolean {
  if (!val) return false;
  const normalized = String(val)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  return /\d+[\.٫]\d+/.test(normalized) || /\.\d+/.test(normalized) || /٫\d+/.test(normalized);
}

@Injectable()
export class TrackingFactorService {
  constructor(
    @Inject(ITrackingFactorRepositoryToken)
    private readonly repository: ITrackingFactorRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  private async validateDuplicates(
    params: {
      code?: number;
      name?: string;
      name2?: string | null;
      priority?: number;
    },
    excludeId?: number
  ) {
    if (params.code !== undefined && params.code !== null) {
      const isDuplicateCode = await this.repository.checkDuplicateCode(params.code, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException(`کد عامل ردیابی (${params.code}) تکراری می‌باشد`);
      }
    }

    if (params.name !== undefined && params.name !== null && params.name.trim() !== '') {
      const trimmedName = params.name.trim();
      const isDuplicateName = await this.repository.checkDuplicateName(trimmedName, excludeId);
      if (isDuplicateName) {
        throw new BadRequestException(`عنوان عامل ردیابی (${trimmedName}) تکراری می‌باشد`);
      }
    }

    if (params.name2 !== undefined && params.name2 !== null && params.name2.trim() !== '') {
      const trimmedName2 = params.name2.trim();
      const isDuplicateName2 = await this.repository.checkDuplicateName2(trimmedName2, excludeId);
      if (isDuplicateName2) {
        throw new BadRequestException(`عنوان 2 عامل ردیابی (${trimmedName2}) تکراری می‌باشد`);
      }
    }

    if (params.priority !== undefined && params.priority !== null) {
      const isDuplicatePriority = await this.repository.checkDuplicatePriority(params.priority, excludeId);
      if (isDuplicatePriority) {
        throw new BadRequestException(`اولویت نمایش (${params.priority}) تکراری می‌باشد`);
      }
    }
  }

  async create(dto: CreateTrackingFactorDto): Promise<TrackingFactor> {
    const userId = this.requestContextService.getUserId() || 1;
    const { bsId, compId } = await this.getScope();

    const code = dto.TrackingFactorCode ? Number(dto.TrackingFactorCode) : await this.repository.calculateNextCode();
    const priority = (dto.DisplayPriority !== undefined && dto.DisplayPriority !== null && !isNaN(Number(dto.DisplayPriority)) && Number(dto.DisplayPriority) > 0)
      ? Number(dto.DisplayPriority)
      : await this.repository.calculateNextPriority();
    const name = dto.TrackingFactorName ? dto.TrackingFactorName.trim() : '';
    const name2 = (dto.TrackingFactorName2 && dto.TrackingFactorName2.trim()) ? dto.TrackingFactorName2.trim() : null;

    await this.validateDuplicates({
      code,
      name,
      name2,
      priority,
    });

    const newId = await this.idGenerationService.generateNextIdBlock('TrackingFactors', 1);

    const trackingFactorType = dto.TrackingFactorType ? Number(dto.TrackingFactorType) : 1;
    if (trackingFactorType === 8) {
      if (!dto.StartValue || !dto.StartValue.trim()) {
        throw new BadRequestException('لطفاً مقدار شروع را وارد نمایید');
      }
      if (!dto.EndValue || !dto.EndValue.trim()) {
        throw new BadRequestException('لطفاً مقدار پایان را وارد نمایید');
      }
      if (containsDecimal(dto.StartValue)) {
        throw new BadRequestException('مقدار فیلد شروع نمی‌تواند شامل عدد اعشاری باشد');
      }
      if (containsDecimal(dto.EndValue)) {
        throw new BadRequestException('مقدار فیلد پایان نمی‌تواند شامل عدد اعشاری باشد');
      }
    }

    const entityData: Partial<TrackingFactor> = {
      TrackingFactorID: newId,
      TrackingFactorCode: code,
      TrackingFactorName: name,
      TrackingFactorName2: name2,
      TrackingFactorType: trackingFactorType,
      StartValue: trackingFactorType === 8 ? (dto.StartValue ? dto.StartValue.trim() : 'از سریال') : null,
      EndValue: trackingFactorType === 8 ? (dto.EndValue ? dto.EndValue.trim() : 'تا سریال') : null,
      IsConstantValue: !!dto.IsConstantValue,
      DisplayPriority: priority,
      IsActive: dto.IsActive !== undefined ? !!dto.IsActive : true,
      companyRef: compId,
      businessStructureRef: bsId,
      creator: userId,
      lastModifier: userId,
    };

    const saved = await this.repository.create(entityData);

    // Save related items
    const relatedItemIds = this.extractRelatedItemIds(dto);
    if (relatedItemIds.length > 0) {
      const startRelId = await this.idGenerationService.generateNextIdBlock(
        'TrackingFactorItemRelated',
        relatedItemIds.length,
      );
      for (let i = 0; i < relatedItemIds.length; i++) {
        const itemId = relatedItemIds[i];
        const relId = startRelId + i;
        const relEntity = this.repository.manager.create(TrackingFactorItemRelated, {
          TrackingFactorItemRelatedID: relId,
          TrackingFactorRef: newId,
          ItemRef: itemId,
          companyRef: compId,
          businessStructureRef: bsId,
          creator: userId,
          lastModifier: userId,
        });
        await this.repository.manager.save(relEntity);
      }
    }

    // Save constant values if enabled
    if (dto.IsConstantValue && dto.constantValues && dto.constantValues.length > 0) {
      await this.saveConstantValues(newId, dto.constantValues, bsId, compId, userId);
    }

    return this.findOne(newId);
  }

  async update(id: number, dto: UpdateTrackingFactorDto): Promise<TrackingFactor> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('عامل ردیابی یافت نشد');
    }

    const userId = this.requestContextService.getUserId() || 1;
    const { bsId, compId } = await this.getScope();

    const code = dto.TrackingFactorCode !== undefined ? Number(dto.TrackingFactorCode) : existing.TrackingFactorCode;
    const name = dto.TrackingFactorName !== undefined ? dto.TrackingFactorName.trim() : existing.TrackingFactorName;
    const name2 = dto.TrackingFactorName2 !== undefined
      ? ((dto.TrackingFactorName2 && dto.TrackingFactorName2.trim()) ? dto.TrackingFactorName2.trim() : null)
      : existing.TrackingFactorName2;
    const priority = dto.DisplayPriority !== undefined ? Number(dto.DisplayPriority) : existing.DisplayPriority;
    const isConstantValue = dto.IsConstantValue !== undefined ? !!dto.IsConstantValue : existing.IsConstantValue;

    await this.validateDuplicates({
      code,
      name,
      name2,
      priority,
    }, id);

    const trackingFactorType = dto.TrackingFactorType !== undefined ? Number(dto.TrackingFactorType) : existing.TrackingFactorType;
    if (trackingFactorType === 8) {
      const startVal = dto.StartValue !== undefined ? dto.StartValue : existing.StartValue;
      const endVal = dto.EndValue !== undefined ? dto.EndValue : existing.EndValue;
      if (!startVal || !startVal.trim()) {
        throw new BadRequestException('لطفاً مقدار شروع را وارد نمایید');
      }
      if (!endVal || !endVal.trim()) {
        throw new BadRequestException('لطفاً مقدار پایان را وارد نمایید');
      }
      if (containsDecimal(startVal)) {
        throw new BadRequestException('مقدار فیلد شروع نمی‌تواند شامل عدد اعشاری باشد');
      }
      if (containsDecimal(endVal)) {
        throw new BadRequestException('مقدار فیلد پایان نمی‌تواند شامل عدد اعشاری باشد');
      }
    }

    const updateData: Partial<TrackingFactor> = {
      TrackingFactorCode: code,
      TrackingFactorName: name,
      TrackingFactorName2: name2,
      TrackingFactorType: trackingFactorType,
      StartValue: trackingFactorType === 8 ? (dto.StartValue !== undefined ? (dto.StartValue ? dto.StartValue.trim() : null) : existing.StartValue) : null,
      EndValue: trackingFactorType === 8 ? (dto.EndValue !== undefined ? (dto.EndValue ? dto.EndValue.trim() : null) : existing.EndValue) : null,
      IsConstantValue: isConstantValue,
      DisplayPriority: priority,
      IsActive: dto.IsActive !== undefined ? !!dto.IsActive : existing.IsActive,
      lastModifier: userId,
    };

    await this.repository.update(id, updateData);

    // Sync related items
    if (dto.relatedItemIds !== undefined || dto.relatedItems !== undefined) {
      await this.repository.manager.delete(TrackingFactorItemRelated, { TrackingFactorRef: id });
      const relatedItemIds = this.extractRelatedItemIds(dto);
      if (relatedItemIds.length > 0) {
        const startRelId = await this.idGenerationService.generateNextIdBlock(
          'TrackingFactorItemRelated',
          relatedItemIds.length,
        );
        for (let i = 0; i < relatedItemIds.length; i++) {
          const itemId = relatedItemIds[i];
          const relId = startRelId + i;
          const relEntity = this.repository.manager.create(TrackingFactorItemRelated, {
            TrackingFactorItemRelatedID: relId,
            TrackingFactorRef: id,
            ItemRef: itemId,
            companyRef: compId,
            businessStructureRef: bsId,
            creator: userId,
            lastModifier: userId,
          });
          await this.repository.manager.save(relEntity);
        }
      }
    }

    // Sync constant values
    if (dto.constantValues !== undefined || dto.IsConstantValue !== undefined) {
      await this.repository.manager.delete(TrackingFactorConstantValue, { TrackingFactorRef: id });
      if (isConstantValue && dto.constantValues && dto.constantValues.length > 0) {
        await this.saveConstantValues(id, dto.constantValues, bsId, compId, userId);
      }
    }

    return this.findOne(id);
  }

  private async saveConstantValues(
    trackingFactorId: number,
    constantValues: { RowNumber?: number; ConstantValue: string }[],
    bsId: number,
    compId: number,
    userId: number,
  ) {
    if (!Array.isArray(constantValues) || constantValues.length === 0) return;

    const validValues = constantValues.filter(
      (cvItem) => cvItem && cvItem.ConstantValue !== undefined && cvItem.ConstantValue !== null && String(cvItem.ConstantValue).trim() !== ''
    );

    if (validValues.length === 0) return;

    const startCvId = await this.idGenerationService.generateNextIdBlock('TrackingFactorConstantValue', validValues.length);

    for (let i = 0; i < validValues.length; i++) {
      const cvItem = validValues[i];
      const cvId = startCvId + i;
      const cvEntity = this.repository.manager.create(TrackingFactorConstantValue, {
        TrackingFactorConstantValueID: cvId,
        TrackingFactorRef: trackingFactorId,
        RowNumber: cvItem.RowNumber || i + 1,
        ConstantValue: String(cvItem.ConstantValue).trim(),
        companyRef: compId,
        businessStructureRef: bsId,
        creator: userId,
        lastModifier: userId,
      });
      await this.repository.manager.save(cvEntity);
    }
  }

  private extractRelatedItemIds(dto: { relatedItemIds?: number[]; relatedItems?: { ItemRef: number }[] }): number[] {
    const set = new Set<number>();
    if (Array.isArray(dto.relatedItemIds)) {
      dto.relatedItemIds.forEach((id) => {
        if (id && !isNaN(Number(id))) set.add(Number(id));
      });
    }
    if (Array.isArray(dto.relatedItems)) {
      dto.relatedItems.forEach((item) => {
        if (item && item.ItemRef && !isNaN(Number(item.ItemRef))) set.add(Number(item.ItemRef));
      });
    }
    return Array.from(set);
  }

  async findAll(query: any): Promise<any> {
    const { skip, take } = query;
    const [data, total] = await Promise.all([
      this.repository.findAll({
        skip: skip ? parseInt(skip) : undefined,
        take: take ? parseInt(take) : undefined,
      }),
      this.repository.count(),
    ]);
    return { data, total, success: true };
  }

  async findOne(id: number): Promise<TrackingFactor> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException('عامل ردیابی یافت نشد');
    }
    return entity;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  async getNextNumber(): Promise<{ documentNumber: number; nextPriority: number }> {
    const [nextCode, nextPriority] = await Promise.all([
      this.repository.calculateNextCode(),
      this.repository.calculateNextPriority(),
    ]);
    return { documentNumber: nextCode, nextPriority };
  }

  async getNextPriority(): Promise<{ nextPriority: number }> {
    const nextPriority = await this.repository.calculateNextPriority();
    return { nextPriority };
  }

  async getAvailableItems(trackingFactorId?: number): Promise<any[]> {
    const { bsId, compId, isShared } = await this.getScope();

    const qb = this.repository.manager.createQueryBuilder(Item, 'item');

    if (isShared) {
      qb.where('item.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('item.companyRef = :compId', { compId });
    }

    // Condition: Must be active (IsActive = true)
    qb.andWhere('item.IsActive = :isActive', { isActive: true });

    qb.orderBy('item.ItemCode', 'ASC');

    const items = await qb.getMany();
    return items.map((i) => ({
      ItemID: Number(i.ItemID),
      ItemCode: i.ItemCode,
      ItemName: i.ItemName,
      ItemName2: i.ItemName2 || '',
      MeasurementUnitRef: i.MeasurementUnitRef,
      IsActive: i.IsActive,
    }));
  }

  async validateRange(body: {
    userStart?: string;
    userEnd?: string;
    baseStart?: string;
    baseEnd?: string;
    factorName?: string;
  }): Promise<{ valid: boolean; message: string }> {
    const normalize = (val?: string) => {
      if (!val) return '';
      return String(val)
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
        .replace(/,/g, '')
        .trim();
    };

    const userStartStr = normalize(body.userStart);
    const userEndStr = normalize(body.userEnd);
    const baseStartStr = normalize(body.baseStart);
    const baseEndStr = normalize(body.baseEnd);

    const fName = body.factorName ? ` (${body.factorName})` : '';

    if (baseStartStr && baseEndStr) {
      if (/^\d+$/.test(baseStartStr) && /^\d+$/.test(baseEndStr)) {
        const baseStartNum = BigInt(baseStartStr);
        const baseEndNum = BigInt(baseEndStr);

        if (userStartStr && /^\d+$/.test(userStartStr)) {
          const uStartNum = BigInt(userStartStr);
          if (uStartNum < baseStartNum) {
            return {
              valid: false,
              message: `مقدار "از سریال" (${body.userStart})${fName} نمی‌تواند کمتر از شروع بازه فرم مبنا (${body.baseStart}) باشد.`,
            };
          }
          if (uStartNum > baseEndNum) {
            return {
              valid: false,
              message: `مقدار "از سریال" (${body.userStart})${fName} نمی‌تواند بیشتر از پایان بازه فرم مبنا (${body.baseEnd}) باشد.`,
            };
          }
        }

        if (userEndStr && /^\d+$/.test(userEndStr)) {
          const uEndNum = BigInt(userEndStr);
          if (uEndNum > baseEndNum) {
            return {
              valid: false,
              message: `مقدار "تا سریال" (${body.userEnd})${fName} نمی‌تواند بیشتر از پایان بازه فرم مبنا (${body.baseEnd}) باشد.`,
            };
          }
          if (uEndNum < baseStartNum) {
            return {
              valid: false,
              message: `مقدار "تا سریال" (${body.userEnd})${fName} نمی‌تواند کمتر از شروع بازه فرم مبنا (${body.baseStart}) باشد.`,
            };
          }
        }

        if (userStartStr && userEndStr && /^\d+$/.test(userStartStr) && /^\d+$/.test(userEndStr)) {
          const uStartNum = BigInt(userStartStr);
          const uEndNum = BigInt(userEndStr);
          if (uEndNum < uStartNum) {
            return {
              valid: false,
              message: `مقدار "تا سریال" (${body.userEnd})${fName} نمی‌تواند از "از سریال" (${body.userStart}) کمتر باشد.`,
            };
          }
        }
      }
    }

    return { valid: true, message: 'بازه معتبر است.' };
  }
}
