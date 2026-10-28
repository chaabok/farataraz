import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

@Entity({ schema: 'Sle', name: 'SalesOrderDetails' })
export class SalesOrderDetail {
  @PrimaryColumn({ type: 'bigint' })
  SalesOrderDetailID: number;

  @Column({ type: 'bigint' })
  SalesOrderRef: number;

  @ManyToOne(() => SalesOrder, (so) => so.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesOrderRef' })
  salesOrder?: SalesOrder;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  UnitName?: string;

  @Column({ type: 'int', default: 1 })
  UnitType: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  Quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  UnitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Discount: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  TotalPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  PriceAfterDiscount: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Additions: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  NetPrice: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;
}
