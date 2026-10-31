import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesReturnPermissionItem } from './sales-return-permission-item.entity';
import { SalesReturnPermissionFactor } from './sales-return-permission-factor.entity';

// ---------------------------------------------------------------------------
// Task 139: مجوز برگشت از فروش (Sales Return Permission) — SalesDocumentType = 6
// کلون کامل مجوز فروش (Task 133):
// ۱) تنظیمات هدر از «تنظیمات اسناد فروش» نوع ۶ (آیتم مجوز برگشت از فروش) خوانده می‌شود
// ۲) ذخیره‌سازی در Sle.SalesReturnPermissions از طریق /api/sle/sales-return-permissions
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesReturnPermissions' })
export class SalesReturnPermission extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesReturnPermissionID: number;

  @Column({ type: 'int' })
  PermissionNumber: number;

  // تاریخ سند به‌صورت رشته میلادی ISO (YYYY-MM-DD) ذخیره می‌شود
  @Column({ type: 'varchar', length: 10, nullable: true })
  PermissionDate?: string;

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

  // توضیحات مجوز برگشت از فروش
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

  @OneToMany(() => SalesReturnPermissionItem, (item) => item.salesReturnPermission, { cascade: true })
  items?: SalesReturnPermissionItem[];

  // عوامل مجوز برگشت از فروش (اضافات/کسورات) — همانند مجوز فروش
  @OneToMany(() => SalesReturnPermissionFactor, (factor) => factor.salesReturnPermission, { cascade: true })
  factors?: SalesReturnPermissionFactor[];
}
