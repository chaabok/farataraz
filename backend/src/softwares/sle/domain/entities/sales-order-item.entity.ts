import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

@Entity({ schema: 'Sle', name: 'SalesOrderItems' })
export class SalesOrderItem {
  @PrimaryColumn({ type: 'bigint' })
  SalesOrderItemID: number;

  @Column({ type: 'bigint' })
  SalesOrderRef: number;

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

  @ManyToOne(() => SalesOrder, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesOrderRef' })
  salesOrder?: SalesOrder;
}
