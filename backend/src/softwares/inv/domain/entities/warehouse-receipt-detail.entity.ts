import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WarehouseReceipt } from './warehouse-receipt.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'WarehouseVouchersDetails' })
export class WarehouseReceiptDetail {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseReceiptDetailID: number;

  @Column({ type: 'bigint' })
  WarehouseReceiptRef: number;

  @ManyToOne(() => WarehouseReceipt, (wr) => wr.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'WarehouseReceiptRef' })
  warehouseReceipt?: WarehouseReceipt;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @ManyToOne(() => Item, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  BaseNumber?: string;

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;
}
