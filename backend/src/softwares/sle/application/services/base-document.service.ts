import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder } from '../../domain/entities/sales-order.entity';
import { SalesProformaInvoice } from '../../domain/entities/sales-proforma-invoice.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';

/**
 * Task 93: سرویس «سند مبنا» فرم‌های فروش
 *
 * فهرست اسناد قابل انتخاب به‌عنوان مبنا برای فرم‌های سفارش فروش / پیش فاکتور فروش.
 * کد نوع سند مبنا همان کدهای BASE_DOCUMENT_TYPE_LABELS در تنظیمات اسناد فروش است:
 *   0=بدون مبنا، 1..7=انواع سند فروش، 8=رسید انبار، 9=حواله انبار
 *
 * خروجی نرمال‌شده برای SingleSelectDropDown:
 *   { id, number, date, customer }
 * فقط اسناد با وضعیت بازبینی‌شده (4) یا تاییدشده (5) به‌عنوان مبنا پیشنهاد می‌شوند.
 */
@Injectable()
export class SleBaseDocumentService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly orderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesProformaInvoice)
    private readonly proformaRepository: Repository<SalesProformaInvoice>,
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

  /** وضعیت‌های مجاز برای انتخاب به‌عنوان مبنا: بازبینی‌شده (4) و تاییدشده (5) */
  private static readonly BASE_ELIGIBLE_STATUSES = [4, 5];

  async getAvailableBaseDocuments(type: number): Promise<any[]> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const t = Number(type);

    // سفارش فروش (1)
    if (t === 1) {
      const qb = this.orderRepository
        .createQueryBuilder('so')
        .where('so.Status IN (4, 5)'); // بازبینی‌شده (4) و تاییدشده (5)
      if (bsId && bsId > 1) qb.andWhere('(so.businessStructureRef = :bsId OR so.businessStructureRef IS NULL)', { bsId });
      if (compId && compId > 1) qb.andWhere('(so.companyRef = :compId OR so.companyRef IS NULL)', { compId });
      if (fiscalYearId) qb.andWhere('(so.FiscalYearRef = :fiscalYearId OR so.FiscalYearRef IS NULL)', { fiscalYearId });
      qb.orderBy('so.OrderNumber', 'DESC');
      const docs = await qb.getMany();
      return docs.map((d) => ({
        id: Number(d.SalesOrderID),
        number: d.OrderNumber,
        date: d.OrderDate || '',
        customer: d.CustomerName || '',
      }));
    }

    // پیش فاکتور فروش (2)
    if (t === 2) {
      const qb = this.proformaRepository
        .createQueryBuilder('sp')
        .where('sp.Status IN (4, 5)'); // بازبینی‌شده (4) و تاییدشده (5)
      if (bsId && bsId > 1) qb.andWhere('(sp.businessStructureRef = :bsId OR sp.businessStructureRef IS NULL)', { bsId });
      if (compId && compId > 1) qb.andWhere('(sp.companyRef = :compId OR sp.companyRef IS NULL)', { compId });
      if (fiscalYearId) qb.andWhere('(sp.FiscalYearRef = :fiscalYearId OR sp.FiscalYearRef IS NULL)', { fiscalYearId });
      qb.orderBy('sp.ProformaNumber', 'DESC');
      const docs = await qb.getMany();
      return docs.map((d) => ({
        id: Number(d.SalesProformaID),
        number: d.ProformaNumber,
        date: d.ProformaDate || '',
        customer: d.CustomerName || '',
      }));
    }

    // سایر انواع (قرارداد فروش، مجوز فروش، فاکتور فروش، مجوز برگشت، فاکتور برگشت،
    // رسید انبار و حواله انبار) فعلاً فهرستی ندارند — خروجی خالی
    return [];
  }

  // ---------------------------------------------------------------------------
  // Task 94: جزئیات کامل سند مبنا (هدر + اقلام + عوامل + عوامل ردیابی) برای انتقال
  // اطلاعات به فرم پیش فاکتور فروش هنگام انتخاب «شماره مبنا» در هدر فرم.
  // خروجی شامل فیلدهای نوع فروش/مرکز فروش/محل تحویل/روش تسویه سند مبنا و همه اقلام
  // (به همراه TrackingFactorValues هر ردیف) و همه عوامل (اضافات/کسورات) است.
  // ---------------------------------------------------------------------------
  async getBaseDocumentDetail(type: number, id: number): Promise<any> {
    const t = Number(type);
    const docId = Number(id);
    if (!docId || !Number.isFinite(docId)) return null;

    // سفارش فروش (1)
    if (t === 1) {
      const doc = await this.orderRepository.findOne({
        where: { SalesOrderID: docId as any },
        relations: ['items', 'factors'],
      });
      if (!doc) return null;
      return this.normalizeBaseDetail(doc, doc.OrderNumber, doc.OrderDate, doc.items, doc.factors);
    }

    // پیش فاکتور فروش (2)
    if (t === 2) {
      const doc = await this.proformaRepository.findOne({
        where: { SalesProformaID: docId as any },
        relations: ['items', 'factors'],
      });
      if (!doc) return null;
      return this.normalizeBaseDetail(
        doc,
        doc.ProformaNumber,
        doc.ProformaDate,
        doc.items,
        doc.factors,
      );
    }

    return null;
  }

  /** نرمال‌سازی خروجی جزئیات سند مبنا برای مصرف فرانت‌اند */
  private normalizeBaseDetail(
    header: any,
    number: number | undefined,
    date: string | undefined,
    items: any[] | undefined,
    factors: any[] | undefined,
  ) {
    return {
      id: Number(header.SalesOrderID ?? header.SalesProformaID),
      number: number ?? null,
      date: date || '',
      customer: header.CustomerName || '',
      CustomerRef: header.CustomerRef != null ? Number(header.CustomerRef) : null,
      CustomerName: header.CustomerName || '',
      SalesTypeRef: header.SalesTypeRef != null ? Number(header.SalesTypeRef) : null,
      SalesCenterRef: header.SalesCenterRef != null ? Number(header.SalesCenterRef) : null,
      DeliveryLocationRef:
        header.DeliveryLocationRef != null ? Number(header.DeliveryLocationRef) : null,
      SettlementMethodRef:
        header.SettlementMethodRef != null ? Number(header.SettlementMethodRef) : null,
      items: (items || [])
        .slice()
        .sort((a, b) => (Number(a.RowNo) || 0) - (Number(b.RowNo) || 0))
        .map((i) => ({
          ItemRef: i.ItemRef != null ? Number(i.ItemRef) : null,
          ItemCode: i.ItemCode || '',
          ItemName: i.ItemName || '',
          UnitName: i.UnitName || 'عدد',
          Quantity: Number(i.Quantity) || 0,
          UnitPrice: Number(i.UnitPrice) || 0,
          TotalPrice: Number(i.TotalPrice) || 0,
          Description: i.Description || '',
          // Task 94: عوامل ردیابی ردیف سند مبنا — به فرم مقصد منتقل و غیرقابل تغییر می‌شود
          trackingFactorValues: i.TrackingFactorValues ?? null,
        })),
      factors: (factors || [])
        .slice()
        .sort((a, b) => (Number(a.RowNo) || 0) - (Number(b.RowNo) || 0))
        .map((f) => ({
          RowNo: Number(f.RowNo) || 1,
          FactorTitle: f.FactorTitle || '',
          FactorType: Number(f.FactorType) === 2 ? 2 : 1,
          Amount: Number(f.Amount) || 0,
          Description: f.Description || '',
        })),
    };
  }
}
