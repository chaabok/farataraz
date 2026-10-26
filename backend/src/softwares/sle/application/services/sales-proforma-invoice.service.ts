import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SalesProformaInvoice } from '../../domain/entities/sales-proforma-invoice.entity';
import { SalesProformaInvoiceItem } from '../../domain/entities/sales-proforma-invoice-item.entity';
import { SalesProformaInvoiceFactor } from '../../domain/entities/sales-proforma-invoice-factor.entity';
import { CreateSalesProformaInvoiceDto, UpdateSalesProformaInvoiceDto } from '../dtos/sales-proforma-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams, toLatinDigits } from '../../../../core/utils/typeorm-query-builder';

// ---------------------------------------------------------------------------
// Task 88: سرویس پیش فاکتور فروش — همانند SalesOrderService با فیلد تاریخ اعتبار
// شماره‌گذاری سند: MAX+1 به تفکیک ساختار/شرکت/سال مالی (الگوی سفارش فروش)
// ---------------------------------------------------------------------------
@Injectable()
export class SalesProformaInvoiceService {
  constructor(
    @InjectRepository(SalesProformaInvoice)
    private readonly repository: Repository<SalesProformaInvoice>,
    @InjectRepository(SalesProformaInvoiceItem)
    private readonly itemRepository: Repository<SalesProformaInvoiceItem>,
    @InjectRepository(SalesProformaInvoiceFactor)
    private readonly factorRepository: Repository<SalesProformaInvoiceFactor>,
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
      .select('MAX(sp.ProformaNumber)', 'max')
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
  private validateRequiredRefs(dto: CreateSalesProformaInvoiceDto | UpdateSalesProformaInvoiceDto): void {
    const missing: string[] = [];
    if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef)) missing.push('نوع فروش');
    if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef)) missing.push('مرکز فروش');
    if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef)) missing.push('محل تحویل');
    if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef)) missing.push('روش تسویه');
    if (missing.length > 0) {
      throw new BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
    }
  }

  async create(dto: CreateSalesProformaInvoiceDto): Promise<SalesProformaInvoice> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    let proformaNumber = dto.ProformaNumber ? Number(dto.ProformaNumber) : 0;
    if (!proformaNumber || proformaNumber <= 0) {
      const next = await this.getNextNumber();
      proformaNumber = next.documentNumber;
    }

    const salesProformaId = await this.idGenerationService.generateNextIdBlock('SalesProformaInvoices', 1);

    const proforma = this.repository.create({
      SalesProformaID: salesProformaId,
      ProformaNumber: proformaNumber,
      ProformaDate: dto.ProformaDate || null,
      ValidityDate: dto.ValidityDate || null,
      CustomerRef: dto.CustomerRef ? Number(dto.CustomerRef) : null,
      CustomerName: dto.CustomerName || null,
      SalesTypeRef: dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null,
      SalesCenterRef: dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null,
      DeliveryLocationRef: dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null,
      SettlementMethodRef: dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null,
      Status: Number(dto.Status || 1),
      Description: dto.Description || null,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
    });

    await this.repository.save(proforma);

    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(salesProformaId, validItems);
    }

    // ذخیره عوامل پیش فاکتور فروش (اضافات/کسورات)
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(salesProformaId, validFactors);
    }

    return this.findOne(salesProformaId);
  }

  private async saveItems(salesProformaId: number, items: any[]): Promise<void> {
    const startItemId = await this.idGenerationService.generateNextIdBlock('SalesProformaInvoiceItems', items.length);
    const itemsToSave: SalesProformaInvoiceItem[] = items.map((d, idx) => {
      const qty = Number(d.Quantity || 0);
      const price = Number(d.UnitPrice || 0);
      return this.itemRepository.create({
        SalesProformaInvoiceItemID: startItemId + idx,
        SalesProformaRef: salesProformaId,
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
   * ذخیره عوامل پیش فاکتور فروش — همانند سفارش فروش
   */
  private async saveFactors(salesProformaId: number, factors: any[]): Promise<void> {
    const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesProformaInvoiceFactors', factors.length);
    const factorsToSave: SalesProformaInvoiceFactor[] = factors.map((f, idx) =>
      this.factorRepository.create({
        SalesProformaInvoiceFactorID: startFactorId + idx,
        SalesProformaRef: salesProformaId,
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
   * فهرست پیش فاکتورهای فروش با پشتیبانی کامل از پارامترهای دیتاگرید:
   * pageIndex/pageSize، sorting، columnFilters، advancedFilters و search/globalFilter.
   * خروجی { items, total } — پنل فهرست و RecordNavigator هر دو سازگار هستند.
   */
  async findAll(query?: any): Promise<{ items: SalesProformaInvoice[]; total: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('sp')
      .where('sp.businessStructureRef = :bsId', { bsId })
      .andWhere('sp.companyRef = :compId', { compId })
      .andWhere('sp.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('sp.ProformaNumber', 'DESC');

    // جستجوی سریع (search / globalFilter): جستجوی متنی در شماره، مشتری و توضیحات
    // (ارقام بومی کاربر مثل ۳ به لاتین نرمال می‌شود تا با داده‌های لاتین مقایسه شوند)
    const searchQ = toLatinDigits(String(query?.search ?? query?.globalFilter ?? '')).trim();
    if (searchQ) {
      qb.andWhere(
        new Brackets((b) => {
          b.where('CAST(sp.ProformaNumber AS VARCHAR) ILIKE :spSearch', { spSearch: `%${searchQ}%` })
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

  async findOne(id: number): Promise<SalesProformaInvoice> {
    const proforma = await this.repository.findOne({
      where: { SalesProformaID: id },
      relations: ['items', 'factors'],
    });

    if (!proforma) {
      throw new NotFoundException(`پیش فاکتور فروش با شناسه ${id} یافت نشد`);
    }

    return proforma;
  }

  async update(id: number, dto: UpdateSalesProformaInvoiceDto): Promise<SalesProformaInvoice> {
    const proforma = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    if (dto.ProformaNumber !== undefined && dto.ProformaNumber !== null && Number(dto.ProformaNumber) > 0) {
      proforma.ProformaNumber = Number(dto.ProformaNumber);
    }
    proforma.ProformaDate = dto.ProformaDate !== undefined ? dto.ProformaDate : proforma.ProformaDate;
    proforma.ValidityDate = dto.ValidityDate !== undefined ? (dto.ValidityDate || null) : proforma.ValidityDate;
    proforma.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : proforma.CustomerRef;
    proforma.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : proforma.CustomerName;
    proforma.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : proforma.SalesTypeRef;
    proforma.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : proforma.SalesCenterRef;
    proforma.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : proforma.DeliveryLocationRef;
    proforma.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : proforma.SettlementMethodRef;
    proforma.Status = dto.Status !== undefined ? Number(dto.Status || 1) : proforma.Status;
    proforma.Description = dto.Description !== undefined ? dto.Description : proforma.Description;
    proforma.lastModifier = userId;

    await this.repository.save(proforma);

    // Replace items
    await this.itemRepository.delete({ SalesProformaRef: id });
    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(id, validItems);
    }

    // جایگزینی عوامل پیش فاکتور (حذف قبلی‌ها و درج دوباره)
    await this.factorRepository.delete({ SalesProformaRef: id });
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(id, validFactors);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const proforma = await this.findOne(id);
    await this.itemRepository.delete({ SalesProformaRef: id });
    await this.factorRepository.delete({ SalesProformaRef: id });
    await this.repository.remove(proforma);
    return { success: true };
  }
}
