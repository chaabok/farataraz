import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SalesPermission } from '../../domain/entities/sales-permission.entity';
import { SalesPermissionItem } from '../../domain/entities/sales-permission-item.entity';
import { SalesPermissionFactor } from '../../domain/entities/sales-permission-factor.entity';
import { CreateSalesPermissionDto, UpdateSalesPermissionDto } from '../dtos/sales-permission.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams, toLatinDigits } from '../../../../core/utils/typeorm-query-builder';

// ---------------------------------------------------------------------------
// Task 133: سرویس مجوز فروش — همانند SalesInvoiceService (Task 130)
// شماره‌گذاری سند: MAX+1 به تفکیک ساختار/شرکت/سال مالی (الگوی فاکتور فروش)
// ---------------------------------------------------------------------------
@Injectable()
export class SalesPermissionService {
  constructor(
    @InjectRepository(SalesPermission)
    private readonly repository: Repository<SalesPermission>,
    @InjectRepository(SalesPermissionItem)
    private readonly itemRepository: Repository<SalesPermissionItem>,
    @InjectRepository(SalesPermissionFactor)
    private readonly factorRepository: Repository<SalesPermissionFactor>,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;

    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;

    return { bsId, compId, fiscalYearId };
  }

  async getNextNumber(): Promise<{ documentNumber: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const maxResult = await this.repository
      .createQueryBuilder('sp')
      .select('MAX(sp.PermissionNumber)', 'max')
      .where('sp.businessStructureRef = :bsId', { bsId })
      .andWhere('sp.companyRef = :compId', { compId })
      .andWhere('sp.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  /**
   * اعتبارسنجی فیلدهای اجباری هدر: نوع فروش، مرکز فروش، محل تحویل و روش تسویه نمی‌توانند خالی باشند
   */
  private validateRequiredRefs(dto: CreateSalesPermissionDto | UpdateSalesPermissionDto): void {
    const missing: string[] = [];
    if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef)) missing.push('نوع فروش');
    if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef)) missing.push('مرکز فروش');
    if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef)) missing.push('محل تحویل');
    if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef)) missing.push('روش تسویه');
    if (missing.length > 0) {
      throw new BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
    }
  }

  async create(dto: CreateSalesPermissionDto): Promise<SalesPermission> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    let permissionNumber = dto.PermissionNumber ? Number(dto.PermissionNumber) : 0;
    if (!permissionNumber || permissionNumber <= 0) {
      const next = await this.getNextNumber();
      permissionNumber = next.documentNumber;
    }

    const salesPermissionId = await this.idGenerationService.generateNextIdBlock('SalesPermissions', 1);

    const permission = this.repository.create({
      SalesPermissionID: salesPermissionId,
      PermissionNumber: permissionNumber,
      PermissionDate: dto.PermissionDate || null,
      CustomerRef: dto.CustomerRef ? Number(dto.CustomerRef) : null,
      CustomerName: dto.CustomerName || null,
      SalesTypeRef: dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null,
      SalesCenterRef: dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null,
      DeliveryLocationRef: dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null,
      SettlementMethodRef: dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null,
      Status: Number(dto.Status || 1),
      Description: dto.Description || null,
      // سند مبنا — 0/undefined = بدون مبنا (null)
      BaseDocumentTypeRef: dto.BaseDocumentTypeRef !== undefined && dto.BaseDocumentTypeRef !== null && Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null,
      BaseDocumentRef: dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
    });

    await this.repository.save(permission);

    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(salesPermissionId, validItems);
    }

    // ذخیره عوامل مجوز فروش (اضافات/کسورات)
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(salesPermissionId, validFactors);
    }

    return this.findOne(salesPermissionId);
  }

  private async saveItems(salesPermissionId: number, items: any[]): Promise<void> {
    const startItemId = await this.idGenerationService.generateNextIdBlock('SalesPermissionItems', items.length);
    const itemsToSave: SalesPermissionItem[] = items.map((d, idx) => {
      const qty = Number(d.Quantity || 0);
      const price = Number(d.UnitPrice || 0);
      return this.itemRepository.create({
        SalesPermissionItemID: startItemId + idx,
        SalesPermissionRef: salesPermissionId,
        RowNo: idx + 1,
        ItemRef: Number(d.ItemRef),
        ItemCode: d.ItemCode || null,
        ItemName: d.ItemName || null,
        UnitName: d.UnitName || null,
        Quantity: qty,
        UnitPrice: price,
        // مبلغ کل بدون اعشار (گرد شده)
        TotalPrice: d.TotalPrice !== undefined && d.TotalPrice !== null && d.TotalPrice !== ''
          ? Math.round(Number(d.TotalPrice))
          : Math.round(qty * price),
        Description: d.Description || null,
        // مقادیر عوامل ردیابی (خروجی مودال عامل ردیابی)
        TrackingFactorValues: (d as any).trackingFactorValues ?? (d as any).TrackingFactorValues ?? (d as any).trackingFactors ?? null,
      });
    });
    await this.itemRepository.save(itemsToSave);
  }

  /**
   * ذخیره عوامل مجوز فروش — همانند فاکتور فروش
   */
  private async saveFactors(salesPermissionId: number, factors: any[]): Promise<void> {
    const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesPermissionFactors', factors.length);
    const factorsToSave: SalesPermissionFactor[] = factors.map((f, idx) =>
      this.factorRepository.create({
        SalesPermissionFactorID: startFactorId + idx,
        SalesPermissionRef: salesPermissionId,
        RowNo: idx + 1,
        FactorTitle: f.FactorTitle || null,
        FactorType: Number(f.FactorType || 1),
        Amount: Number(f.Amount || 0),
        Description: f.Description || null,
      }),
    );
    await this.factorRepository.save(factorsToSave);
  }

  /**
   * فهرست مجوزهای فروش با پشتیبانی کامل از پارامترهای دیتاگرید:
   * pageIndex/pageSize، sorting، columnFilters، advancedFilters و search/globalFilter.
   * خروجی { items, total } — پنل فهرست و RecordNavigator هر دو سازگار هستند.
   */
  async findAll(query?: any): Promise<{ items: SalesPermission[]; total: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('sp')
      .where('sp.businessStructureRef = :bsId', { bsId })
      .andWhere('sp.companyRef = :compId', { compId })
      .andWhere('sp.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('sp.PermissionNumber', 'DESC');

    // جستجوی سریع (search / globalFilter): جستجوی متنی در شماره، مشتری و توضیحات
    // (ارقام بومی کاربر مثل ۳ به لاتین نرمال می‌شود تا با داده‌های لاتین مقایسه شوند)
    const searchQ = toLatinDigits(String(query?.search ?? query?.globalFilter ?? '')).trim();
    if (searchQ) {
      qb.andWhere(
        new Brackets((b) => {
          b.where('CAST(sp.PermissionNumber AS VARCHAR) ILIKE :spSearch', { spSearch: `%${searchQ}%` })
            .orWhere('sp.CustomerName ILIKE :spSearch', { spSearch: `%${searchQ}%` })
            .orWhere('sp.Description ILIKE :spSearch', { spSearch: `%${searchQ}%` });
        }),
      );
    }

    // فیلترهای ستونی/پیشرفته + مرتب‌سازی؛ صفحه‌بندی فقط وقتی pageSize ارسال شده باشد
    const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
    applyDataGridParams(qb, query as any, 'sp', { skipPagination: !hasPageSize });

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: number): Promise<SalesPermission> {
    const permission = await this.repository.findOne({
      where: { SalesPermissionID: id },
      relations: ['items', 'factors'],
    });

    if (!permission) {
      throw new NotFoundException(`مجوز فروش با شناسه ${id} یافت نشد`);
    }

    return permission;
  }

  async update(id: number, dto: UpdateSalesPermissionDto): Promise<SalesPermission> {
    const permission = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    if (dto.PermissionNumber !== undefined && dto.PermissionNumber !== null && Number(dto.PermissionNumber) > 0) {
      permission.PermissionNumber = Number(dto.PermissionNumber);
    }
    permission.PermissionDate = dto.PermissionDate !== undefined ? dto.PermissionDate : permission.PermissionDate;
    permission.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : permission.CustomerRef;
    permission.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : permission.CustomerName;
    permission.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : permission.SalesTypeRef;
    permission.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : permission.SalesCenterRef;
    permission.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : permission.DeliveryLocationRef;
    permission.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : permission.SettlementMethodRef;
    permission.Status = dto.Status !== undefined ? Number(dto.Status || 1) : permission.Status;
    permission.Description = dto.Description !== undefined ? dto.Description : permission.Description;
    // سند مبنا — 0/undefined = بدون مبنا (null)
    permission.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : permission.BaseDocumentTypeRef;
    permission.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : permission.BaseDocumentRef;
    permission.lastModifier = userId;

    await this.repository.save(permission);

    // Replace items
    await this.itemRepository.delete({ SalesPermissionRef: id });
    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(id, validItems);
    }

    // جایگزینی عوامل مجوز (حذف قبلی‌ها و درج دوباره)
    await this.factorRepository.delete({ SalesPermissionRef: id });
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(id, validFactors);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const permission = await this.findOne(id);
    await this.itemRepository.delete({ SalesPermissionRef: id });
    await this.factorRepository.delete({ SalesPermissionRef: id });
    await this.repository.remove(permission);
    return { success: true };
  }
}
