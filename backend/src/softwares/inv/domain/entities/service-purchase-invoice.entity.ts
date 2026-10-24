import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ServicePurchaseInvoiceDetail } from './service-purchase-invoice-detail.entity';
import { ServicePurchaseInvoiceFactor } from './service-purchase-invoice-factor.entity';

@Entity({ schema: 'Inv', name: 'ServicePurchaseInvoices' })
export class ServicePurchaseInvoice extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ServicePurchaseInvoiceID: number;

  @Column({ type: 'int', default: 1 })
  BaseType: number;

  @Column({ type: 'bigint', nullable: true })
  SupplyRequestRef?: number;

  @Column({ type: 'bigint', nullable: true })
  SupplierRef?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  SupplierName?: string;

  @Column({ type: 'bigint' })
  InvoiceNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  InvoiceDate: Date | string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  BaseDocumentNumber?: string;

  @Column({ type: 'int', default: 1 })
  Status: number;

  @Column({ type: 'int', default: 1 })
  CurrencyRef: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description?: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => ServicePurchaseInvoiceDetail, (detail) => detail.servicePurchaseInvoice, { cascade: true })
  details?: ServicePurchaseInvoiceDetail[];

  @OneToMany(() => ServicePurchaseInvoiceFactor, (factor) => factor.servicePurchaseInvoice, { cascade: true })
  factors?: ServicePurchaseInvoiceFactor[];
}
