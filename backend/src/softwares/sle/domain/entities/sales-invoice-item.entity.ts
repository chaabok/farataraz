import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesInvoice } from './sales-invoice.entity';

// ---------------------------------------------------------------------------
// Task 130: اقلام فاکتور فروش — جدول Sle.SalesInvoiceItems
// ساختار دقیقاً مانند SalesProformaInvoiceItems است
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesInvoiceItems' })
export class SalesInvoiceItem {
  @PrimaryColumn({ type: 'bigint' })
  SalesInvoiceItemID: number;

  @Column({ type: 'bigint' })
  SalesInvoiceRef: number;

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

  @ManyToOne(() => SalesInvoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesInvoiceRef' })
  salesInvoice?: SalesInvoice;
}
