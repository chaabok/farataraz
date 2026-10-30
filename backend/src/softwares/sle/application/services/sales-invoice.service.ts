import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SalesInvoice } from '../../domain/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../../domain/entities/sales-invoice-item.entity';
import { SalesInvoiceFactor } from '../../domain/entities/sales-invoice-factor.entity';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../dtos/sales-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams, toLatinDigits } from '../../../../core/utils/typeorm-query-builder';

// ---------------------------------------------------------------------------
// Task 130: سرویس فاکتور فروش — همانند SalesProformaInvoiceService (Task 88)
// شماره‌گذاری سند: MAX+1 به تفکیک ساختار/شرکت/سال مالی (الگوی قرارداد فروش)
// ---------------------------------------------------------------------------
@Injectable()
export class SalesInvoiceService {
  constructor(
    @InjectRepository(SalesInvoice)
    private readonly repository: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceItem)
    private readonly itemRepository: Repository<SalesInvoiceItem>,
    @InjectRepository(SalesInvoiceFactor)
    private readonly factorRepository: Repository<SalesInvoiceFactor>,
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
      .createQueryBuilder('si')
      .select('MAX(si.InvoiceNumber)', 'max')
      .where('si.businessStructureRef = :bsId', { bsId })
      .andWhere('si.companyRef = :compId', { compId })
      .andWhere('si.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  /**
   * اعتبارسنجی فیلدهای اجباری هدر: نوع فروش، مرکز فروش، محل تحویل و روش تسویه نمی‌توانند خالی باشند
   */
  private validateRequiredRefs(dto: CreateSalesInvoiceDto | UpdateSalesInvoiceDto): void {
    const missing: string[] = [];
    if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef)) missing.push('نوع فروش');
    if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef)) missing.push('مرکز فروش');
    if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef)) missing.push('محل تحویل');
    if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef)) missing.push('روش تسویه');
    if (missing.length > 0) {
      throw new BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
    }
  }

  async create(dto: CreateSalesInvoiceDto): Promise<SalesInvoice> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    let invoiceNumber = dto.InvoiceNumber ? Number(dto.InvoiceNumber) : 0;
    if (!invoiceNumber || invoiceNumber <= 0) {
      const next = await this.getNextNumber();
      invoiceNumber = next.documentNumber;
    }

    const salesInvoiceId = await this.idGenerationService.generateNextIdBlock('SalesInvoices', 1);

    const invoice = this.repository.create({
      SalesInvoiceID: salesInvoiceId,
      InvoiceNumber: invoiceNumber,
      InvoiceDate: dto.InvoiceDate || null,
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

    await this.repository.save(invoice);

    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(salesInvoiceId, validItems);
    }

    // ذخیره عوامل فاکتور فروش (اضافات/کسورات)
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(salesInvoiceId, validFactors);
    }

    return this.findOne(salesInvoiceId);
  }

  private async saveItems(salesInvoiceId: number, items: any[]): Promise<void> {
    const startItemId = await this.idGenerationService.generateNextIdBlock('SalesInvoiceItems', items.length);
    const itemsToSave: SalesInvoiceItem[] = items.map((d, idx) => {
      const qty = Number(d.Quantity || 0);
      const price = Number(d.UnitPrice || 0);
      return this.itemRepository.create({
        SalesInvoiceItemID: startItemId + idx,
        SalesInvoiceRef: salesInvoiceId,
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
   * ذخیره عوامل فاکتور فروش — همانند پیش فاکتور فروش
   */
  private async saveFactors(salesInvoiceId: number, factors: any[]): Promise<void> {
    const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesInvoiceFactors', factors.length);
    const factorsToSave: SalesInvoiceFactor[] = factors.map((f, idx) =>
      this.factorRepository.create({
        SalesInvoiceFactorID: startFactorId + idx,
        SalesInvoiceRef: salesInvoiceId,
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
   * فهرست فاکتورهای فروش با پشتیبانی کامل از پارامترهای دیتاگرید:
   * pageIndex/pageSize، sorting، columnFilters، advancedFilters و search/globalFilter.
   * خروجی { items, total } — پنل فهرست و RecordNavigator هر دو سازگار هستند.
   */
  async findAll(query?: any): Promise<{ items: SalesInvoice[]; total: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('si')
      .where('si.businessStructureRef = :bsId', { bsId })
      .andWhere('si.companyRef = :compId', { compId })
      .andWhere('si.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('si.InvoiceNumber', 'DESC');

    // جستجوی سریع (search / globalFilter): جستجوی متنی در شماره، مشتری و توضیحات
    // (ارقام بومی کاربر مثل ۳ به لاتین نرمال می‌شود تا با داده‌های لاتین مقایسه شوند)
    const searchQ = toLatinDigits(String(query?.search ?? query?.globalFilter ?? '')).trim();
    if (searchQ) {
      qb.andWhere(
        new Brackets((b) => {
          b.where('CAST(si.InvoiceNumber AS VARCHAR) ILIKE :siSearch', { siSearch: `%${searchQ}%` })
            .orWhere('si.CustomerName ILIKE :siSearch', { siSearch: `%${searchQ}%` })
            .orWhere('si.Description ILIKE :siSearch', { siSearch: `%${searchQ}%` });
        }),
      );
    }

    // فیلترهای ستونی/پیشرفته + مرتب‌سازی؛ صفحه‌بندی فقط وقتی pageSize ارسال شده باشد
    const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
    applyDataGridParams(qb, query as any, 'si', { skipPagination: !hasPageSize });

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: number): Promise<SalesInvoice> {
    const invoice = await this.repository.findOne({
      where: { SalesInvoiceID: id },
      relations: ['items', 'factors'],
    });

    if (!invoice) {
      throw new NotFoundException(`فاکتور فروش با شناسه ${id} یافت نشد`);
    }

    return invoice;
  }

  async update(id: number, dto: UpdateSalesInvoiceDto): Promise<SalesInvoice> {
    const invoice = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    if (dto.InvoiceNumber !== undefined && dto.InvoiceNumber !== null && Number(dto.InvoiceNumber) > 0) {
      invoice.InvoiceNumber = Number(dto.InvoiceNumber);
    }
    invoice.InvoiceDate = dto.InvoiceDate !== undefined ? dto.InvoiceDate : invoice.InvoiceDate;
    invoice.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : invoice.CustomerRef;
    invoice.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : invoice.CustomerName;
    invoice.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : invoice.SalesTypeRef;
    invoice.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : invoice.SalesCenterRef;
    invoice.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : invoice.DeliveryLocationRef;
    invoice.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : invoice.SettlementMethodRef;
    invoice.Status = dto.Status !== undefined ? Number(dto.Status || 1) : invoice.Status;
    invoice.Description = dto.Description !== undefined ? dto.Description : invoice.Description;
    // سند مبنا — 0/undefined = بدون مبنا (null)
    invoice.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : invoice.BaseDocumentTypeRef;
    invoice.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : invoice.BaseDocumentRef;
    invoice.lastModifier = userId;

    await this.repository.save(invoice);

    // Replace items
    await this.itemRepository.delete({ SalesInvoiceRef: id });
    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(id, validItems);
    }

    // جایگزینی عوامل فاکتور (حذف قبلی‌ها و درج دوباره)
    await this.factorRepository.delete({ SalesInvoiceRef: id });
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(id, validFactors);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const invoice = await this.findOne(id);
    await this.itemRepository.delete({ SalesInvoiceRef: id });
    await this.factorRepository.delete({ SalesInvoiceRef: id });
    await this.repository.remove(invoice);
    return { success: true };
  }
}
