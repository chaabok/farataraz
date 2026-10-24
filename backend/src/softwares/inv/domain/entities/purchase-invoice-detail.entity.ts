import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseInvoice } from './purchase-invoice.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'PurchaseInvoiceDetails' })
export class PurchaseInvoiceDetail {
  @PrimaryColumn({ type: 'bigint' })
  PurchaseInvoiceDetailID: number;

  @Column({ type: 'bigint' })
  PurchaseInvoiceRef: number;

  @ManyToOne(() => PurchaseInvoice, (pi) => pi.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PurchaseInvoiceRef' })
  purchaseInvoice?: PurchaseInvoice;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

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
}
