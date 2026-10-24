import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TemporaryItemReceiptDetail } from './temporary-item-receipt-detail.entity';
import { TemporaryItemReceiptFactor } from './temporary-item-receipt-factor.entity';

@Entity({ schema: 'Inv', name: 'TemporaryItemReceipts' })
export class TemporaryItemReceipt extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  TemporaryItemReceiptID: number;

  @Column({ type: 'int', default: 1 })
  Type: number;

  @Column({ type: 'int', default: 1 })
  BaseType: number;

  @Column({ type: 'bigint', nullable: true })
  SupplyRequestRef?: number;

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

  @OneToMany(() => TemporaryItemReceiptDetail, (detail) => detail.temporaryItemReceipt, { cascade: true })
  details?: TemporaryItemReceiptDetail[];

  @OneToMany(() => TemporaryItemReceiptFactor, (factor) => factor.temporaryItemReceipt, { cascade: true })
  factors?: TemporaryItemReceiptFactor[];
}
