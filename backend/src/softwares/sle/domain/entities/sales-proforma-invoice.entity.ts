import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesProformaInvoiceItem } from './sales-proforma-invoice-item.entity';
import { SalesProformaInvoiceFactor } from './sales-proforma-invoice-factor.entity';

// ---------------------------------------------------------------------------
// Task 88: پیش فاکتور فروش (Sales Proforma Invoice) — SalesDocumentType = 2
// هدر پیش فاکتور دقیقاً مانند سفارش فروش است با این تفاوت که فیلد «تاریخ اعتبار»
// (ValidityDate) نیز دارد؛ پیش فاکتور برای اعلام قیمت و شرایط فروش به مشتری صادر
// می‌شود و تا تاریخ اعتبار ذکر شده معتبر است.
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesProformaInvoices' })
export class SalesProformaInvoice extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesProformaID: number;

  @Column({ type: 'int' })
  ProformaNumber: number;

  // تاریخ پیش فاکتور به‌صورت رشته میلادی ISO (YYYY-MM-DD) ذخیره می‌شود
  @Column({ type: 'varchar', length: 10, nullable: true })
  ProformaDate?: string;

  // تاریخ اعتبار پیش فاکتور — تا این تاریخ پیش فاکتور برای مشتری معتبر است
  @Column({ type: 'varchar', length: 10, nullable: true })
  ValidityDate?: string;

  @Column({ type: 'bigint', nullable: true })
  CustomerRef?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  CustomerName?: string;

  // ارجاع به نوع فروش (Sle.SalesTypes) — اجباری در فرم
  @Column({ type: 'bigint', nullable: true })
  SalesTypeRef?: number;

  // ارجاع به مرکز فروش (Sle.SalesCenters) — اجباری در فرم
  @Column({ type: 'bigint', nullable: true })
  SalesCenterRef?: number;

  // ارجاع به محل تحویل (Sle.DeliveryLocations) — اجباری در فرم
  @Column({ type: 'bigint', nullable: true })
  DeliveryLocationRef?: number;

  // ارجاع به روش تسویه (Sle.SettlementMethods) — اجباری در فرم
  @Column({ type: 'bigint', nullable: true })
  SettlementMethodRef?: number;

  @Column({ type: 'int', default: 1 })
  Status: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description?: string;

  // Task 93: نوع سند مبنا — 0=بدون مبنا، 1-7=انواع سند فروش، 8=رسید انبار، 9=حواله انبار
  // (همان کدهای BASE_DOCUMENT_TYPE_LABELS در تنظیمات اسناد فروش)
  @Column({ type: 'int', nullable: true })
  BaseDocumentTypeRef?: number;

  // Task 93: ارجاع به سند مبنا مشخص (ID سند انتخاب‌شده از دراپ‌داون «مبنا») — در حالت بدون مبنا null
  @Column({ type: 'bigint', nullable: true })
  BaseDocumentRef?: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => SalesProformaInvoiceItem, (item) => item.salesProforma, { cascade: true })
  items?: SalesProformaInvoiceItem[];

  // عوامل پیش فاکتور (اضافات/کسورات) — همانند سفارش فروش
  @OneToMany(() => SalesProformaInvoiceFactor, (factor) => factor.salesProforma, { cascade: true })
  factors?: SalesProformaInvoiceFactor[];
}
