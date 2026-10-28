import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  ISalesTrackingFactorSettingRepository,
  ISalesTrackingFactorSettingRepositoryToken,
} from '../../domain/repositories/sales-tracking-factor-setting.repository.interface';
import { SalesTrackingFactorSetting } from '../../domain/entities/sales-tracking-factor-setting.entity';
import { UpsertSalesTrackingFactorSettingDto } from '../dtos/create-sales-tracking-factor-setting.dto';
import {
  SALES_DOCUMENT_TYPE_LABELS,
  isValidSalesDocumentType,
} from '../../domain/entities/sales-document-type.enum';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

export interface SalesTrackingFactorSettingView {
  SalesDocumentType: number;
  SalesDocumentTypeName: string;
  ShowTrackingFactor: boolean;
}

@Injectable()
export class SalesTrackingFactorSettingService {
  constructor(
    @Inject(ISalesTrackingFactorSettingRepositoryToken)
    private readonly repository: ISalesTrackingFactorSettingRepository,
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

  /**
   * لیست کامل انواع سند فروش (enum، همان منبع فرم تنظیمات اسناد فروش)
   * همراه با وضعیت ذخیره‌شده نمایش عامل ردیابی (پیش‌فرض false).
   */
  async getSettings(): Promise<SalesTrackingFactorSettingView[]> {
    const { bsId } = await this.getScope();
    const all = await this.repository.findAll();
    const rows = all.filter((x) => !x.BusinessStructureRef || Number(x.BusinessStructureRef) === bsId);
    return SALES_DOCUMENT_TYPE_LABELS.map((t) => {
      const row = rows.find((r) => Number(r.SalesDocumentType) === t.value);
      return {
        SalesDocumentType: t.value,
        SalesDocumentTypeName: t.label,
        ShowTrackingFactor: row ? !!row.ShowTrackingFactor : false,
      };
    });
  }

  /**
   * ذخیره گروهی: برای هر نوع سند فروش، ردیف ساختار جاری upsert می‌شود.
   */
  async upsertMany(settings: UpsertSalesTrackingFactorSettingDto[]): Promise<SalesTrackingFactorSettingView[]> {
    const { bsId, compId } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    if (!Array.isArray(settings)) {
      throw new BadRequestException('لیست تنظیمات ارسال نشده است.');
    }

    // Validate + dedupe (last occurrence wins)
    const unique = new Map<number, boolean>();
    for (const item of settings) {
      const type = Number(item?.SalesDocumentType);
      if (!isValidSalesDocumentType(type)) {
        throw new BadRequestException(`نوع سند فروش ${item?.SalesDocumentType} نامعتبر است.`);
      }
      unique.set(type, !!item.ShowTrackingFactor);
    }

    for (const [type, show] of unique.entries()) {
      const existing = await this.repository.findByType(type, bsId);
      if (existing) {
        await this.repository.update(existing.SalesTrackingFactorSettingID, {
          ShowTrackingFactor: show,
          LastModifierRef: userId,
          LastModificationDate: new Date(),
        });
      } else {
        const id = await this.idGenerationService.generateNextId('SalesTrackingFactorSettings');
        const entity = this.repository.manager.create(SalesTrackingFactorSetting, {
          SalesTrackingFactorSettingID: id,
          SalesDocumentType: type,
          ShowTrackingFactor: show,
          CreatorRef: userId,
          CreationDate: new Date(),
          LastModifierRef: userId,
          LastModificationDate: new Date(),
          CompanyRef: compId,
          BusinessStructureRef: bsId,
        });
        await this.repository.create(entity);
      }
    }

    return this.getSettings();
  }
}
