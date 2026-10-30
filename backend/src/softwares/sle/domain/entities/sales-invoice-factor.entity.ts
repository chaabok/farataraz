import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesInvoice } from './sales-invoice.entity';

// ---------------------------------------------------------------------------
// Task 130: عوامل فاکتور فروش (اضافات/کسورات) — جدول Sle.SalesInvoiceFactors
// ساختار دقیقاً مانند SalesProformaInvoiceFactors است؛ FactorType=1 اضافات و FactorType=2 کسورات
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesInvoiceFactors' })
export class SalesInvoiceFactor {
  @PrimaryColumn({ type: 'bigint' })
  SalesInvoiceFactorID: number;

  @Column({ type: 'bigint' })
  SalesInvoiceRef: number;

  @ManyToOne(() => SalesInvoice, (invoice) => invoice.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesInvoiceRef' })
  salesInvoice?: SalesInvoice;

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
