import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServicePurchaseInvoice } from './service-purchase-invoice.entity';

@Entity({ schema: 'Inv', name: 'ServicePurchaseInvoiceFactors' })
export class ServicePurchaseInvoiceFactor {
  @PrimaryColumn({ type: 'bigint' })
  ServicePurchaseInvoiceFactorID: number;

  @Column({ type: 'bigint' })
  ServicePurchaseInvoiceRef: number;

  @ManyToOne(() => ServicePurchaseInvoice, (spi) => spi.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ServicePurchaseInvoiceRef' })
  servicePurchaseInvoice?: ServicePurchaseInvoice;

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
