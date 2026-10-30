import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesPermission } from './sales-permission.entity';

// ---------------------------------------------------------------------------
// Task 133: اقلام مجوز فروش — جدول Sle.SalesPermissionItems
// ساختار دقیقاً مانند SalesInvoiceItems است (بدون فیلد «تاریخ اعتبار» در سند)
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesPermissionItems' })
export class SalesPermissionItem {
  @PrimaryColumn({ type: 'bigint' })
  SalesPermissionItemID: number;

  @Column({ type: 'bigint' })
  SalesPermissionRef: number;

  @Column({ type: 'int' })
  RowNo: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ItemCode?: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ItemName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  UnitName?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  UnitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  TotalPrice: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  // مقادیر عوامل ردیابی هر ردیف (آرایه ردیف‌های مودال عامل ردیابی)
  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;

  @ManyToOne(() => SalesPermission, (permission) => permission.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesPermissionRef' })
  salesPermission?: SalesPermission;
}
