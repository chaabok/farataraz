import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PettyCash } from './petty-cash.entity';
import { PettyCashSummaryState } from './petty-cash-summary.enum';
import { PettyCashSummaryItem } from './petty-cash-summary-item.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';

@Entity({ schema: 'Rap', name: 'PettyCashSummaries' })
export class PettyCashSummary extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  pettyCashSummaryId: number;

  @Index()
  @Column({ name: 'PettyCashRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  pettyCashRef: number;

  @ManyToOne(() => PettyCash)
  @JoinColumn({ name: 'PettyCashRef', referencedColumnName: 'pettyCashId' })
  pettyCash: PettyCash;

  @Column({ name: 'Number', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  number: number;

  @Column({ name: 'Date', type: 'date', nullable: false })
  date: Date;

  @Column({ name: 'Description', type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  fiscalYearRef: number;

  @Column({ name: 'State', type: 'int', default: PettyCashSummaryState.DRAFT })
  state: PettyCashSummaryState;

  @Index()
  @Column({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  } })
  voucherHeaderRef: number | null;

  @ManyToOne(() => Voucher, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' })
  voucherHeader?: Voucher;

  @OneToMany(() => PettyCashSummaryItem, item => item.pettyCashSummary, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  items: PettyCashSummaryItem[];
}
