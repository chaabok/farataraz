import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesReturnPermission } from './sales-return-permission.entity';

// ---------------------------------------------------------------------------
// Task 139: عوامل مجوز برگشت از فروش (اضافات/کسورات) — جدول Sle.SalesReturnPermissionFactors
// ساختار دقیقاً مانند SalesPermissionFactors است؛ FactorType=1 اضافات و FactorType=2 کسورات
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesReturnPermissionFactors' })
export class SalesReturnPermissionFactor {
  @PrimaryColumn({ type: 'bigint' })
  SalesReturnPermissionFactorID: number;

  @Column({ type: 'bigint' })
  SalesReturnPermissionRef: number;

  @ManyToOne(() => SalesReturnPermission, (permission) => permission.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesReturnPermissionRef' })
  salesReturnPermission?: SalesReturnPermission;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  FactorTitle?: string;

  @Column({ type: 'int', default: 1 })
  FactorType: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Amount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;
}
