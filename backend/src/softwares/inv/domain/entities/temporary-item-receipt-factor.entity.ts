import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TemporaryItemReceipt } from './temporary-item-receipt.entity';

@Entity({ schema: 'Inv', name: 'TemporaryItemReceiptFactors' })
export class TemporaryItemReceiptFactor {
  @PrimaryColumn({ type: 'bigint' })
  TemporaryItemReceiptFactorID: number;

  @Column({ type: 'bigint' })
  TemporaryItemReceiptRef: number;

  @ManyToOne(() => TemporaryItemReceipt, (tr) => tr.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'TemporaryItemReceiptRef' })
  temporaryItemReceipt?: TemporaryItemReceipt;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'varchar', length: 200 })
  FactorTitle: string;

  @Column({ type: 'int', default: 1 })
  FactorType: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Amount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;
}
