import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SalesOrder } from '../../domain/entities/sales-order.entity';
import { SalesOrderItem } from '../../domain/entities/sales-order-item.entity';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../dtos/sales-order.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams, toLatinDigits } from '../../../../core/utils/typeorm-query-builder';

@Injectable()
export class SalesOrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly repository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private readonly itemRepository: Repository<SalesOrderItem>,
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
      .createQueryBuilder('so')
      .select('MAX(so.OrderNumber)', 'max')
      .where('so.businessStructureRef = :bsId', { bsId })
      .andWhere('so.companyRef = :compId', { compId })
      .andWhere('so.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  /**
   * اعتبارسنجی فیلدهای اجباری هدر: نوع فروش، مرکز فروش، محل تحویل و روش تسویه نمی‌توانند خالی باشند
   */
  private validateRequiredRefs(dto: CreateSalesOrderDto | UpdateSalesOrderDto): void {
    const missing: string[] = [];
    if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef)) missing.push('نوع فروش');
    if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef)) missing.push('مرکز فروش');
    if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef)) missing.push('محل تحویل');
    if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef)) missing.push('روش تسویه');
    if (missing.length > 0) {
      throw new BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
    }
  }

  async create(dto: CreateSalesOrderDto): Promise<SalesOrder> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    let orderNumber = dto.OrderNumber ? Number(dto.OrderNumber) : 0;
    if (!orderNumber || orderNumber <= 0) {
      const next = await this.getNextNumber();
      orderNumber = next.documentNumber;
    }

    const salesOrderId = await this.idGenerationService.generateNextIdBlock('SalesOrders', 1);

    const order = this.repository.create({
      SalesOrderID: salesOrderId,
      OrderNumber: orderNumber,
      OrderDate: dto.OrderDate || null,
      DeliveryDate: dto.DeliveryDate || null,
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

    await this.repository.save(order);

    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(salesOrderId, validItems);
    }

    return this.findOne(salesOrderId);
  }

  private async saveItems(salesOrderId: number, items: any[]): Promise<void> {
    const startItemId = await this.idGenerationService.generateNextIdBlock('SalesOrderItems', items.length);
    const itemsToSave: SalesOrderItem[] = items.map((d, idx) => {
      const qty = Number(d.Quantity || 0);
      const price = Number(d.UnitPrice || 0);
      return this.itemRepository.create({
        SalesOrderItemID: startItemId + idx,
        SalesOrderRef: salesOrderId,
        RowNo: idx + 1,
        ItemRef: Number(d.ItemRef),
        ItemCode: d.ItemCode || null,
        ItemName: d.ItemName || null,
        UnitName: d.UnitName || null,
        Quantity: qty,
        UnitPrice: price,
        // Task 64: مبلغ کل بدون اعشار (گرد شده) — ستون «مبلغ» نباید اعشار داشته باشد
        TotalPrice: d.TotalPrice !== undefined && d.TotalPrice !== null && d.TotalPrice !== ''
          ? Math.round(Number(d.TotalPrice))
          : Math.round(qty * price),
        Description: d.Description || null,
        // Task 74: مقادیر عوامل ردیابی (خروجی مودال عامل ردیابی — مشابه PurchaseInvoiceService)
        TrackingFactorValues: (d as any).trackingFactorValues ?? (d as any).TrackingFactorValues ?? (d as any).trackingFactors ?? null,
      });
    });
    await this.itemRepository.save(itemsToSave);
  }

  /**
   * Task 64: فهرست سفارش‌های فروش با پشتیبانی کامل از پارامترهای دیتاگرید:
   * pageIndex/pageSize، sorting، columnFilters، advancedFilters و search/globalFilter.
   * خروجی { items, total } — پنل فهرست و RecordNavigator هر دو سازگار هستند.
   */
  async findAll(query?: any): Promise<{ items: SalesOrder[]; total: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('so')
      .where('so.businessStructureRef = :bsId', { bsId })
      .andWhere('so.companyRef = :compId', { compId })
      .andWhere('so.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('so.OrderNumber', 'DESC');

    // جستجوی سریع (search / globalFilter): جستجوی متنی در شماره، مشتری و توضیحات
    // (ارقام بومی کاربر مثل ۳ به لاتین نرمال می‌شود تا با داده‌های لاتین مقایسه شوند)
    const searchQ = toLatinDigits(String(query?.search ?? query?.globalFilter ?? '')).trim();
    if (searchQ) {
      qb.andWhere(
        new Brackets((b) => {
          b.where('CAST(so.OrderNumber AS VARCHAR) ILIKE :soSearch', { soSearch: `%${searchQ}%` })
            .orWhere('so.CustomerName ILIKE :soSearch', { soSearch: `%${searchQ}%` })
            .orWhere('so.Description ILIKE :soSearch', { soSearch: `%${searchQ}%` });
        }),
      );
    }

    // فیلترهای ستونی/پیشرفته + مرتب‌سازی؛ صفحه‌بندی فقط وقتی pageSize ارسال شده باشد
    const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
    applyDataGridParams(qb, query as any, 'so', { skipPagination: !hasPageSize });

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: number): Promise<SalesOrder> {
    const order = await this.repository.findOne({
      where: { SalesOrderID: id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`سفارش فروش با شناسه ${id} یافت نشد`);
    }

    return order;
  }

  async update(id: number, dto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const order = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    if (dto.OrderNumber !== undefined && dto.OrderNumber !== null && Number(dto.OrderNumber) > 0) {
      order.OrderNumber = Number(dto.OrderNumber);
    }
    order.OrderDate = dto.OrderDate !== undefined ? dto.OrderDate : order.OrderDate;
    order.DeliveryDate = dto.DeliveryDate !== undefined ? (dto.DeliveryDate || null) : order.DeliveryDate;
    order.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : order.CustomerRef;
    order.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : order.CustomerName;
    order.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : order.SalesTypeRef;
    order.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : order.SalesCenterRef;
    order.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : order.DeliveryLocationRef;
    order.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : order.SettlementMethodRef;
    order.Status = dto.Status !== undefined ? Number(dto.Status || 1) : order.Status;
    order.Description = dto.Description !== undefined ? dto.Description : order.Description;
    order.lastModifier = userId;

    await this.repository.save(order);

    // Replace items
    await this.itemRepository.delete({ SalesOrderRef: id });
    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(id, validItems);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const order = await this.findOne(id);
    await this.itemRepository.delete({ SalesOrderRef: id });
    await this.repository.remove(order);
    return { success: true };
  }
}
