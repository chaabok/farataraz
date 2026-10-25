import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ISalesDocumentSettingsRepository,
  ISalesDocumentSettingsRepositoryToken,
} from '../../domain/repositories/sales-document-settings.repository.interface';
import { SalesDocumentSettings } from '../../domain/entities/sales-document-settings.entity';
import {
  CreateSalesDocumentSettingsDto,
  assertValidSalesDocumentType,
} from '../dtos/create-sales-document-settings.dto';
import {
  SALES_DOCUMENT_TYPE_LABELS,
  isValidSalesDocumentType,
  BASE_DOCUMENT_TYPE_LABELS,
  isValidBaseDocumentType,
} from '../../domain/entities/sales-document-type.enum';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesDocumentSettingsService {
  constructor(
    @Inject(ISalesDocumentSettingsRepositoryToken)
    private readonly repository: ISalesDocumentSettingsRepository,
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

  async findAll(): Promise<SalesDocumentSettings[]> {
    const { bsId } = await this.getScope();
    const all = await this.repository.findAll();
    return all.filter((x) => !x.BusinessStructureRef || Number(x.BusinessStructureRef) === bsId);
  }

  async findById(id: number): Promise<SalesDocumentSettings> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`SalesDocumentSettings with ID ${id} not found`);
    }
    return item;
  }

  /** Load the settings row of a given sales document type for the current tenant */
  async findByType(type: number): Promise<SalesDocumentSettings | null> {
    const { bsId } = await this.getScope();
    if (!isValidSalesDocumentType(type)) {
      throw new BadRequestException('نوع سند فروش نامعتبر است.');
    }
    const item = await this.repository.findByType(Number(type), bsId);
    if (!item) {
      // fall back to tenant-agnostic row (legacy data without BS scope)
      return this.repository.findByType(Number(type));
    }
    return item;
  }

  /** Enum list exposed to the frontend dropdowns (single source of truth) */
  getDocumentTypes() {
    return SALES_DOCUMENT_TYPE_LABELS.map((x) => ({ id: x.value, title: x.label }));
  }

  /** فهرست کامل «سند مبنا»: بدون مبنا + انواع سند فروش + رسید انبار + حواله انبار */
  getBaseDocumentTypes() {
    return BASE_DOCUMENT_TYPE_LABELS.map((x) => ({ id: x.value, title: x.label }));
  }

  /**
   * Create or update (upsert) by (SalesDocumentType, BusinessStructureRef).
   * Conditional defaults are nulled when their Show* checkbox is off.
   */
  async upsert(dto: CreateSalesDocumentSettingsDto): Promise<SalesDocumentSettings> {
    assertValidSalesDocumentType(dto);
    const { bsId, compId } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    const type = Number(dto.SalesDocumentType);

    // Sanitize base document types: valid IDs only (بدون مبنا/انواع سند فروش/رسید و حواله انبار), self excluded
    let baseDocumentTypes: string | null = null;
    if (dto.HasBaseDocument && dto.BaseDocumentTypes) {
      const ids = String(dto.BaseDocumentTypes)
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((x) => Number.isFinite(x) && isValidBaseDocumentType(x) && x !== type);
      baseDocumentTypes = ids.length > 0 ? Array.from(new Set(ids)).join(',') : null;
    }

    // Conditional default refs: only kept when their display flag is on
    const defaultWarehouseRef = dto.ShowWarehouse ? dto.DefaultWarehouseRef ?? null : null;
    const defaultSalesCenterRef = dto.ShowSalesCenter ? dto.DefaultSalesCenterRef ?? null : null;
    const defaultSalesTypeRef = dto.ShowSalesType ? dto.DefaultSalesTypeRef ?? null : null;
    const defaultDeliveryLocationRef = dto.ShowDeliveryLocations ? dto.DefaultDeliveryLocationRef ?? null : null;
    const defaultSettlementMethodRef = dto.ShowSettlementMethod ? dto.DefaultSettlementMethodRef ?? null : null;

    const existing = await this.repository.findByType(type, bsId);

    if (existing) {
      const updateData: Partial<SalesDocumentSettings> = {
        HasBaseDocument: dto.HasBaseDocument ?? false,
        BaseDocumentTypes: baseDocumentTypes,
        ShowWarehouse: dto.ShowWarehouse ?? false,
        DefaultWarehouseRef: defaultWarehouseRef,
        ShowSalesCenter: dto.ShowSalesCenter ?? false,
        DefaultSalesCenterRef: defaultSalesCenterRef,
        ShowSalesType: dto.ShowSalesType ?? false,
        DefaultSalesTypeRef: defaultSalesTypeRef,
        ShowDeliveryLocations: dto.ShowDeliveryLocations ?? false,
        DefaultDeliveryLocationRef: defaultDeliveryLocationRef,
        ShowSettlementMethod: dto.ShowSettlementMethod ?? false,
        DefaultSettlementMethodRef: defaultSettlementMethodRef,
        HasAccountingDocument: dto.HasAccountingDocument ?? false,
        ShowPurchaseSalesParameters: dto.ShowPurchaseSalesParameters ?? false,
        IsActive: dto.IsActive ?? true,
        LastModifierRef: userId,
        LastModificationDate: new Date(),
      };
      return this.repository.update(existing.SalesDocumentSettingsID, updateData);
    }

    const id =
      dto.SalesDocumentSettingsID ||
      (await this.idGenerationService.generateNextId('SalesDocumentSettings'));

    const entity = this.repository.manager.create(SalesDocumentSettings, {
      SalesDocumentSettingsID: id,
      SalesDocumentType: type,
      HasBaseDocument: dto.HasBaseDocument ?? false,
      BaseDocumentTypes: baseDocumentTypes,
      ShowWarehouse: dto.ShowWarehouse ?? false,
      DefaultWarehouseRef: defaultWarehouseRef,
      ShowSalesCenter: dto.ShowSalesCenter ?? false,
      DefaultSalesCenterRef: defaultSalesCenterRef,
      ShowSalesType: dto.ShowSalesType ?? false,
      DefaultSalesTypeRef: defaultSalesTypeRef,
      ShowDeliveryLocations: dto.ShowDeliveryLocations ?? false,
      DefaultDeliveryLocationRef: defaultDeliveryLocationRef,
      ShowSettlementMethod: dto.ShowSettlementMethod ?? false,
      DefaultSettlementMethodRef: defaultSettlementMethodRef,
      HasAccountingDocument: dto.HasAccountingDocument ?? false,
      ShowPurchaseSalesParameters: dto.ShowPurchaseSalesParameters ?? false,
      IsActive: dto.IsActive ?? true,
      CreatorRef: userId,
      CreationDate: new Date(),
      LastModifierRef: userId,
      LastModificationDate: new Date(),
      CompanyRef: compId,
      BusinessStructureRef: bsId,
    });

    return this.repository.create(entity);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
