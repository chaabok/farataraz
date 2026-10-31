import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesInvoiceItem } from './sales-invoice-item.entity';
import { SalesInvoiceFactor } from './sales-invoice-factor.entity';

// ---------------------------------------------------------------------------
// Task 130: فاکتور فروش (Sales Invoice) — SalesDocumentType = 5
// کلون کامل پیش فاکتور فروش (Task 88) با این تفاوت‌ها:
// ۱) فیلد «تاریخ اعتبار» پیش فاکتور در این فرم حذف شده است
// ۲) تنظیمات هدر از «تنظیمات اسناد فروش» نوع ۵ خوانده می‌شود
// ذخیره‌سازی در Sle.SalesInvoices از طریق /api/sle/sales-invoices
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesInvoices' })
export class SalesInvoice extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesInvoiceID: number;

  @Column({ type: 'int' })
  InvoiceNumber: number;

  // تاریخ سند به‌صورت رشته میلادی ISO (YYYY-MM-DD) ذخیره می‌شود
  @Column({ type: 'varchar', length: 10, nullable: true })
  InvoiceDate?: string;

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

  // توضیحات فاکتور فروش
  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description?: string;

  // نوع سند مبنا — 0=بدون مبنا، 1-7=انواع سند فروش، 8=رسید انبار، 9=حواله انبار
  @Column({ type: 'int', nullable: true })
  BaseDocumentTypeRef?: number;

  // ارجاع به سند مبنا مشخص (ID سند انتخاب‌شده از دراپ‌داون «مبنا») — در حالت بدون مبنا null
  @Column({ type: 'bigint', nullable: true })
  BaseDocumentRef?: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => SalesInvoiceItem, (item) => item.salesInvoice, { cascade: true })
  items?: SalesInvoiceItem[];

  // عوامل فاکتور فروش (اضافات/کسورات) — همانند پیش فاکتور فروش
  @OneToMany(() => SalesInvoiceFactor, (factor) => factor.salesInvoice, { cascade: true })
  factors?: SalesInvoiceFactor[];
}
