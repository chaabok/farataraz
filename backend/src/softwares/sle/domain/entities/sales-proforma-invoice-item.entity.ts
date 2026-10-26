import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesProformaInvoice } from './sales-proforma-invoice.entity';

// ---------------------------------------------------------------------------
// Task 88: اقلام پیش فاکتور فروش — جدول Sle.SalesProformaInvoiceItems
// ساختار دقیقاً مانند SalesOrderItems است
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesProformaInvoiceItems' })
export class SalesProformaInvoiceItem {
  @PrimaryColumn({ type: 'bigint' })
  SalesProformaInvoiceItemID: number;

  @Column({ type: 'bigint' })
  SalesProformaRef: number;

  @Column({ type: 'int' })
  RowNo: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ItemCode?: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ItemName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  UnitName?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  UnitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  TotalPrice: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  // مقادیر عوامل ردیابی هر ردیف (آرایه ردیف‌های مودال عامل ردیابی)
  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;

  @ManyToOne(() => SalesProformaInvoice, (proforma) => proforma.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesProformaRef' })
  salesProforma?: SalesProformaInvoice;
}
