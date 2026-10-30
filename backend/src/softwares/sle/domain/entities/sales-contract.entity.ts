import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesContractItem } from './sales-contract-item.entity';
import { SalesContractFactor } from './sales-contract-factor.entity';

// ---------------------------------------------------------------------------
// Task 128: قرارداد فروش (Sales Contract) — SalesDocumentType = 3
// کلون کامل پیش فاکتور فروش (Task 88) با این تفاوت‌های برچسب/فیلد:
// ۱) فیلد «تاریخ اعتبار» با نام «تاریخ قرارداد» (ContractDate) ذخیره می‌شود
// ۲) فیلد «توضیحات» با نام «موضوع قرارداد» (ContractSubject) ذخیره می‌شود
// ذخیره‌سازی در Sle.SalesContracts از طریق /api/sle/sales-contracts
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesContracts' })
export class SalesContract extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesContractID: number;

  @Column({ type: 'int' })
  ContractNumber: number;

  // تاریخ سند به‌صورت رشته میلادی ISO (YYYY-MM-DD) ذخیره می‌شود
  @Column({ type: 'varchar', length: 10, nullable: true })
  DocumentDate?: string;

  // تاریخ قرارداد — برچسب جدید فیلد «تاریخ اعتبار» پیش فاکتور
  @Column({ type: 'varchar', length: 10, nullable: true })
  ContractDate?: string;

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

  // موضوع قرارداد — برچسب جدید فیلد «توضیحات» پیش فاکتور
  @Column({ type: 'varchar', length: 1000, nullable: true })
  ContractSubject?: string;

  // نوع سند مبنا — 0=بدون مبنا، 1-7=انواع سند فروش، 8=رسید انبار، 9=حواله انبار
  @Column({ type: 'int', nullable: true })
  BaseDocumentTypeRef?: number;

  // ارجاع به سند مبنا مشخص (ID سند انتخاب‌شده از دراپ‌داون «مبنا») — در حالت بدون مبنا null
  @Column({ type: 'bigint', nullable: true })
  BaseDocumentRef?: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => SalesContractItem, (item) => item.salesContract, { cascade: true })
  items?: SalesContractItem[];

  // عوامل قرارداد فروش (اضافات/کسورات) — همانند پیش فاکتور فروش
  @OneToMany(() => SalesContractFactor, (factor) => factor.salesContract, { cascade: true })
  factors?: SalesContractFactor[];
}
