import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesReturnPermission } from './sales-return-permission.entity';

// ---------------------------------------------------------------------------
// Task 139: اقلام مجوز برگشت از فروش — جدول Sle.SalesReturnPermissionItems
// ساختار دقیقاً مانند SalesPermissionItems است
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesReturnPermissionItems' })
export class SalesReturnPermissionItem {
  @PrimaryColumn({ type: 'bigint' })
  SalesReturnPermissionItemID: number;

  @Column({ type: 'bigint' })
  SalesReturnPermissionRef: number;

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

  @ManyToOne(() => SalesReturnPermission, (permission) => permission.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesReturnPermissionRef' })
  salesReturnPermission?: SalesReturnPermission;
}
