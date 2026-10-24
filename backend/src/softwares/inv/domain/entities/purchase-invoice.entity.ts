import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PurchaseInvoiceDetail } from './purchase-invoice-detail.entity';
import { PurchaseInvoiceFactor } from './purchase-invoice-factor.entity';

@Entity({ schema: 'Inv', name: 'PurchaseInvoices' })
export class PurchaseInvoice extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  PurchaseInvoiceID: number;

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

  @OneToMany(() => PurchaseInvoiceDetail, (detail) => detail.purchaseInvoice, { cascade: true })
  details?: PurchaseInvoiceDetail[];

  @OneToMany(() => PurchaseInvoiceFactor, (factor) => factor.purchaseInvoice, { cascade: true })
  factors?: PurchaseInvoiceFactor[];
}
