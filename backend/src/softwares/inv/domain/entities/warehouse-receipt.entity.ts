import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { WarehouseReceiptDetail } from './warehouse-receipt-detail.entity';
import { WarehouseReceiptFactor } from './warehouse-receipt-factor.entity';

@Entity({ schema: 'Inv', name: 'WarehouseVouchers' })
export class WarehouseReceipt extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseReceiptID: number;

  @Column({ type: 'int', default: 1 })
  BaseType: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseDocumentTypeRef?: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  WarehouseName?: string;

  @Column({ type: 'bigint', nullable: true })
  TemporaryReceiptRef?: number;

  @Column({ type: 'bigint', nullable: true })
  SupplyRequestRef?: number;

  @Column({ type: 'bigint', nullable: true })
  PurchaseInvoiceRef?: number;

  // Task 136: فاکتور فروش مبنا — پیوند حواله انبار با Sle.SalesInvoices
  @Column({ type: 'bigint', nullable: true })
  SalesInvoiceRef?: number;

  @Column({ type: 'bigint', nullable: true })
  SupplierRef?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  SupplierName?: string;

  @Column({ type: 'bigint' })
  ReceiptNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  ReceiptDate: Date | string;

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

  @OneToMany(() => WarehouseReceiptDetail, (detail) => detail.warehouseReceipt, { cascade: true })
  details?: WarehouseReceiptDetail[];

  @OneToMany(() => WarehouseReceiptFactor, (factor) => factor.warehouseReceipt, { cascade: true })
  factors?: WarehouseReceiptFactor[];
}
