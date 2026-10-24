import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseInvoice } from './purchase-invoice.entity';

@Entity({ schema: 'Inv', name: 'PurchaseInvoiceFactors' })
export class PurchaseInvoiceFactor {
  @PrimaryColumn({ type: 'bigint' })
  PurchaseInvoiceFactorID: number;

  @Column({ type: 'bigint' })
  PurchaseInvoiceRef: number;

  @ManyToOne(() => PurchaseInvoice, (pi) => pi.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PurchaseInvoiceRef' })
  purchaseInvoice?: PurchaseInvoice;

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
