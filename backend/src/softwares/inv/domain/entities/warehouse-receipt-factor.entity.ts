import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WarehouseReceipt } from './warehouse-receipt.entity';

@Entity({ schema: 'Inv', name: 'WarehouseVouchersFactors' })
export class WarehouseReceiptFactor {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseReceiptFactorID: number;

  @Column({ type: 'bigint' })
  WarehouseReceiptRef: number;

  @ManyToOne(() => WarehouseReceipt, (wr) => wr.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'WarehouseReceiptRef' })
  warehouseReceipt?: WarehouseReceipt;

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
