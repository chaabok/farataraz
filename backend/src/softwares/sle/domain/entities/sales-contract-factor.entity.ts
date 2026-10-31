import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesContract } from './sales-contract.entity';

// ---------------------------------------------------------------------------
// Task 128: عوامل قرارداد فروش (اضافات/کسورات) — جدول Sle.SalesContractFactors
// ساختار دقیقاً مانند SalesProformaInvoiceFactors است؛ FactorType=1 اضافات و FactorType=2 کسورات
// ---------------------------------------------------------------------------
@Entity({ schema: 'Sle', name: 'SalesContractFactors' })
export class SalesContractFactor {
  @PrimaryColumn({ type: 'bigint' })
  SalesContractFactorID: number;

  @Column({ type: 'bigint' })
  SalesContractRef: number;

  @ManyToOne(() => SalesContract, (contract) => contract.factors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesContractRef' })
  salesContract?: SalesContract;

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
