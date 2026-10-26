import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesOrderItem } from './sales-order-item.entity';
import { SalesOrderFactor } from './sales-order-factor.entity';

@Entity({ schema: 'Sle', name: 'SalesOrders' })
export class SalesOrder extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesOrderID: number;

  @Column({ type: 'int' })
  OrderNumber: number;

  // تاریخ سفارش به‌صورت رشته میلادی ISO (YYYY-MM-DD) ذخیره می‌شود
  @Column({ type: 'varchar', length: 10, nullable: true })
  OrderDate?: string;

  // تاریخ تحویل به‌صورت رشته میلادی ISO (YYYY-MM-DD) ذخیره می‌شود — اختیاری
  @Column({ type: 'varchar', length: 10, nullable: true })
  DeliveryDate?: string;

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

  @OneToMany(() => SalesOrderItem, (item) => item.salesOrder, { cascade: true })
  items?: SalesOrderItem[];

  // Task 85: عوامل سفارش فروش (اضافات/کسورات) — همانند فرم رسید انبار
  @OneToMany(() => SalesOrderFactor, (factor) => factor.salesOrder, { cascade: true })
  factors?: SalesOrderFactor[];
}
