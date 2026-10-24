import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PettyCash } from './petty-cash.entity';
import { PettyCashSummary } from './petty-cash-summary.entity';

@Entity({ schema: 'Rap', name: 'PettyCashRequests' })
export class PettyCashRequest extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint',
    name: 'PettyCashRequestID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  pettyCashRequestId: number;

  @Index()
  @Column({ name: 'PettyCashRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  pettyCashRef: number;

  @ManyToOne(() => PettyCash)
  @JoinColumn({ name: 'PettyCashRef', referencedColumnName: 'pettyCashId' })
  pettyCash: PettyCash;

  @Column({ name: 'RequestNumber', type: 'varchar', length: 100, nullable: false })
  requestNumber: string;

  @Column({ name: 'RequestDate', type: 'date', nullable: false })
  requestDate: Date;

  @Column({ name: 'Basis', type: 'int', default: 0 })
  basis: number;

  @Index()
  @Column({ name: 'PettyCashSummaryRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  } })
  pettyCashSummaryRef: number;

  @ManyToOne(() => PettyCashSummary)
  @JoinColumn({ name: 'PettyCashSummaryRef', referencedColumnName: 'pettyCashSummaryId' })
  pettyCashSummary: PettyCashSummary;

  @Column({ name: 'Status', type: 'int', default: 2 })
  status: number;

  @Column({ name: 'RequestedAmount', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  requestedAmount: number;

  @Column({ name: 'Description', type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  fiscalYearRef: number;
}
