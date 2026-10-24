import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TemporaryItemReceipt } from './temporary-item-receipt.entity';
import { Item } from './item.entity';
import { TemporaryItemReceiptTrackingFactor } from './temporary-item-receipt-tracking-factor.entity';

@Entity({ schema: 'Inv', name: 'TemporaryItemReceiptDetails' })
export class TemporaryItemReceiptDetail {
  @PrimaryColumn({ type: 'bigint' })
  TemporaryItemReceiptDetailID: number;

  @Column({ type: 'bigint' })
  TemporaryItemReceiptRef: number;

  @ManyToOne(() => TemporaryItemReceipt, (tr) => tr.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'TemporaryItemReceiptRef' })
  temporaryItemReceipt?: TemporaryItemReceipt;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @ManyToOne(() => Item, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;

  @OneToMany(() => TemporaryItemReceiptTrackingFactor, (tf) => tf.temporaryItemReceiptDetail, { cascade: true })
  trackingFactors?: TemporaryItemReceiptTrackingFactor[];
}
