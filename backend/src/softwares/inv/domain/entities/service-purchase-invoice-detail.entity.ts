import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServicePurchaseInvoice } from './service-purchase-invoice.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'ServicePurchaseInvoiceDetails' })
export class ServicePurchaseInvoiceDetail {
  @PrimaryColumn({ type: 'bigint' })
  ServicePurchaseInvoiceDetailID: number;

  @Column({ type: 'bigint' })
  ServicePurchaseInvoiceRef: number;

  @ManyToOne(() => ServicePurchaseInvoice, (spi) => spi.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ServicePurchaseInvoiceRef' })
  servicePurchaseInvoice?: ServicePurchaseInvoice;

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
}
