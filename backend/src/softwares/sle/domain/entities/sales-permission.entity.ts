import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesPermissionItem } from './sales-permission-item.entity';
import { SalesPermissionFactor } from './sales-permission-factor.entity';

// ---------------------------------------------------------------------------
// Task 133: مجوز فروش (Sales Permission) — SalesDocumentType = 4
// کلون کامل پیش فاکتور فروش (Task 88) با این تفاوت‌ها:
// ۱) فیلد «تاریخ اعتبار» پیش فاکتور در این فرم حذف شده است
// ۲) تنظیمات هدر از «تنظیمات اسناد فروش» نوع ۴ (آیتم مجوز فروش) خوانده می‌شود
// ذخیره‌سازی در Sle.SalesPermissions از طریق /api/sle/sales-permissions
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesPermissions' })
export class SalesPermission extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesPermissionID: number;

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

  // توضیحات مجوز فروش
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

  @OneToMany(() => SalesPermissionItem, (item) => item.salesPermission, { cascade: true })
  items?: SalesPermissionItem[];

  // عوامل مجوز فروش (اضافات/کسورات) — همانند پیش فاکتور فروش
  @OneToMany(() => SalesPermissionFactor, (factor) => factor.salesPermission, { cascade: true })
  factors?: SalesPermissionFactor[];
}
