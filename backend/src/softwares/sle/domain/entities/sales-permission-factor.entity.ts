import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesPermission } from './sales-permission.entity';

// ---------------------------------------------------------------------------
// Task 133: عوامل مجوز فروش (اضافات/کسورات) — جدول Sle.SalesPermissionFactors
// ساختار دقیقاً مانند SalesInvoiceFactors است؛ FactorType=1 اضافات و FactorType=2 کسورات
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesPermissionFactors' })
export class SalesPermissionFactor {
  @PrimaryColumn({ type: 'bigint' })
  SalesPermissionFactorID: number;

  @Column({ type: 'bigint' })
  SalesPermissionRef: number;

  @ManyToOne(() => SalesPermission, (permission) => permission.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesPermissionRef' })
  salesPermission?: SalesPermission;

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
