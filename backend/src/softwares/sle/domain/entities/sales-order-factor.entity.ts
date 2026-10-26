import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

// ---------------------------------------------------------------------------
// Task 85: عوامل سفارش فروش — همانند فرم رسید انبار (Inv.WarehouseVouchersFactors)
// هر ردیف عامل (اضافات/کسورات) مربوط به یک سفارش فروش در جدول Sle.SalesOrderFactors
// ذخیره می‌شود؛ FactorType=1 اضافات و FactorType=2 کسورات
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesOrderFactors' })
export class SalesOrderFactor {
  @PrimaryColumn({ type: 'bigint' })
  SalesOrderFactorID: number;

  @Column({ type: 'bigint' })
  SalesOrderRef: number;

  @ManyToOne(() => SalesOrder, (order) => order.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesOrderRef' })
  salesOrder?: SalesOrder;

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
