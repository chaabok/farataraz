import { Controller, Get, Put, Body, UseGuards, Param, Delete, Query } from '@nestjs/common';
import { EntityNumberingService } from '../../application/services/entity-numbering.service';
import { FiscalYearService } from '../../application/services/fiscal-year.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';
import { EntityNumbering } from '../../domain/entities/entity-numbering.entity';

const ENTITY_TITLES: Record<string, string> = {
  accounting_doc: 'شماره سند حسابداری',
  accounting_ref: 'شماره عطف حسابداری',
  accounting_fixed: 'شماره ثابت حسابداری',
  detailed_account: 'حساب تفصیلی',
  cost_center: 'مرکز هزینه',
  product: 'کالا و خدمت',
  item: 'کالا و خدمت',
  item_account_category: 'طبقه کالا',
  item_service_group: 'گروه کالا و خدمت',
  measurement_unit: 'واحد سنجش',
  warehouse: 'انبار و محل فیزیکی کالا',
  party: 'طرف حساب',
  fiscal_year: 'سال مالی',
  currency: 'ارز',
  stocktaking_settings: 'تنظیمات انبارگردانی',
  stocktaking_tag_header: 'شماره فرم صدور تگ انبارگردانی',
  stocktaking_tag: 'صدور تگ انبارگردانی',
  StocktakingTagForm: 'شماره فرم صدور تگ انبارگردانی',
  stocktaking_tag_issuance: 'صدور تگ انبارگردانی',
  stocktaking_count: 'شمارش انبارگردانی',
  StocktakingForm: 'شمارش انبارگردانی',
  stocktaking_form: 'شمارش انبارگردانی',
  StocktakingCount: 'شمارش انبارگردانی',
  warehouse_receipt: 'رسید انبار',
  warehouse_issue: 'حواله انبار',
  warehouse_pricing: 'قیمت گذاری اسناد انبار',
  temporary_item_receipt: 'رسید موقت کالا',
  return_temporary_item_receipt: 'برگشت رسید موقت کالا',
  item_request: 'درخواست کالا',
  service_request: 'درخواست خدمت',
  item_supply_request: 'درخواست تامین کالا',
  service_supply_request: 'درخواست تامین خدمت',
  sales_invoice: 'فاکتور فروش',
  sales_order: 'سفارش فروش',
  sales_proforma: 'پیش فاکتور فروش',
  payment_notification: 'اعلامیه پرداخت',
  receipt_notification: 'رسید دریافت',
  received_cheque_operation: 'عملیات چک دریافتنی',
  petty_cash_summary: 'صورتخلاصه تنخواه',
  petty_cash_request: 'درخواست تنخواه',
  reconcile_bank_statement: 'صورتحساب بانکی',
  bank_reconciliation: 'مغایرت بانکی',
  paid_document_clearing: 'وصول اسناد پرداختنی',
  rap_accounting_setting: 'عملیات حسابداری',
  cash: 'صندوق',
  petty_cash: 'تنخواه',
  bank_account: 'حساب بانکی',
  chequebook: 'دسته چک',
  project: 'پروژه',
  contract: 'قرارداد',
};

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('common/entity-numbering')
export class EntityNumberingController {
  constructor(
    private readonly service: EntityNumberingService,
    private readonly fiscalYearService: FiscalYearService,
  ) {}

  @Get()
  @Permissions('FormNumbering:Read')
  async findAll(@Query('search') search?: string) {
    const list = await this.service.findAll();
    const mapped = list.map(item => {
      const rawRef = item.entityRef?.startsWith('entity.') ? item.entityRef.replace('entity.', '') : item.entityRef;
      const title = ENTITY_TITLES[rawRef] || rawRef;
      return {
        ...item,
        entityTitle: title,
        title,
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const filtered = mapped.filter(item => 
        (item.entityTitle && item.entityTitle.toLowerCase().includes(q)) ||
        (item.entityRef && item.entityRef.toLowerCase().includes(q))
      );
      return { data: filtered };
    }

    return { data: mapped };
  }

  @Get(':entityRef')
  @Permissions('FormNumbering:Read')
  async getByEntityRef(@Param('entityRef') entityRef: string) {
    let data = await this.service.findByEntityRef(entityRef);
    const fiscalYears = (await this.fiscalYearService.findAll()) || [];
    
    if (!data) {
      const defaultBase = entityRef === 'warehouse' 
        ? ['warehouse'] 
        : (entityRef === 'stocktaking_tag' || entityRef === 'StocktakingTagForm' || entityRef === 'stocktaking_tag_header')
        ? ['fiscalYear', 'warehouse']
        : ['fiscalYear'];
      data = {
        entityRef,
        numberingMethod: '2',
        numberingType: '1',
        baseNumbering: defaultBase,
        items: {
          fiscalYears: entityRef === 'warehouse' ? [{
            _id: '1',
            fixedChar: '',
            startNumber: '1',
            endNumber: '999999',
            gapNumber: 'ignore',
          }] : fiscalYears.map(fy => ({
            _id: fy.fiscalYearID?.toString() || Math.random().toString(),
            fiscalYearTitle: fy.title,
            startDate: fy.startDate,
            warehouseTitle: '',
            fixedChar: '',
            startNumber: '1',
            endNumber: '999999',
            gapNumber: 'ignore',
          }))
        }
      } as any;
    } else {
      if (entityRef === 'stocktaking_tag' || entityRef === 'StocktakingTagForm' || entityRef === 'stocktaking_tag_header') {
        if (!data.baseNumbering || (Array.isArray(data.baseNumbering) && data.baseNumbering.length === 0)) {
          data.baseNumbering = ['fiscalYear', 'warehouse'];
        } else {
          let b = data.baseNumbering;
          if (typeof b === 'string') {
            try { b = JSON.parse(b); } catch {}
          }
          if (Array.isArray(b)) {
            if (!b.includes('fiscalYear')) b.push('fiscalYear');
            if (!b.includes('warehouse')) b.push('warehouse');
            data.baseNumbering = b;
          }
        }
      }
      // Parse items if string
      if (typeof data.items === 'string') {
        try {
          data.items = JSON.parse(data.items);
        } catch (e) {
          console.error('Failed to parse entity-numbering items JSON:', e);
        }
      }

      if (!data.items) {
        data.items = { fiscalYears: [] };
      }

      if (Array.isArray(data.items)) {
        data.items = { fiscalYears: data.items };
      }

      if (!data.items.fiscalYears || !Array.isArray(data.items.fiscalYears)) {
        data.items.fiscalYears = [];
      }

      // Only add default fiscal year rows if data.items.fiscalYears is empty
      if (data.items.fiscalYears.length === 0 && fiscalYears && fiscalYears.length > 0) {
        fiscalYears.forEach(fy => {
          data.items.fiscalYears.push({
            _id: fy.fiscalYearID?.toString() || Math.random().toString(),
            fiscalYearTitle: fy.title,
            startDate: fy.startDate,
            fixedChar: '',
            startNumber: '1',
            endNumber: '999999',
            gapNumber: 'ignore',
          });
        });
      }
    }

    return { data };
  }

  @Put(':entityRef')
  @Permissions('FormNumbering:Update')
  async saveByEntityRef(
    @Param('entityRef') entityRef: string,
    @Body() body: { numberingMethod: string; numberingType: string; baseNumbering?: string[]; items: any }
  ) {
    const saved = await this.service.save(entityRef, {
      numberingMethod: body.numberingMethod,
      numberingType: body.numberingType,
      baseNumbering: body.baseNumbering || [],
      items: body.items,
    });
    return { data: saved, message: 'Settings saved successfully' };
  }

  @Delete(':entityRef')
  @Permissions('FormNumbering:Update')
  async deleteByEntityRef(@Param('entityRef') entityRef: string) {
    await this.service.remove(entityRef);
    return { message: 'Settings deleted successfully' };
  }
}

