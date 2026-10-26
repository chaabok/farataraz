import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesProformaInvoice } from './sales-proforma-invoice.entity';

// ---------------------------------------------------------------------------
// Task 88: عوامل پیش فاکتور فروش (اضافات/کسورات) — جدول Sle.SalesProformaInvoiceFactors
// ساختار دقیقاً مانند SalesOrderFactors است؛ FactorType=1 اضافات و FactorType=2 کسورات
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesProformaInvoiceFactors' })
export class SalesProformaInvoiceFactor {
  @PrimaryColumn({ type: 'bigint' })
  SalesProformaInvoiceFactorID: number;

  @Column({ type: 'bigint' })
  SalesProformaRef: number;

  @ManyToOne(() => SalesProformaInvoice, (proforma) => proforma.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesProformaRef' })
  salesProforma?: SalesProformaInvoice;

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
