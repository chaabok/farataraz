import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PettyCashSummary } from './petty-cash-summary.entity';
import { RapReason } from './rap-reason.entity';

@Entity({ schema: 'Rap', name: 'PettyCashSummaryItems' })
export class PettyCashSummaryItem extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  pettyCashSummaryItemId: number;

  @Index()
  @Column({ name: 'PettyCashSummaryRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  pettyCashSummaryRef: number;

  @ManyToOne(() => PettyCashSummary, summary => summary.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PettyCashSummaryRef', referencedColumnName: 'pettyCashSummaryId' })
  pettyCashSummary: PettyCashSummary;

  @Column({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  } })
  reasonRef: number;

  @ManyToOne(() => RapReason, { eager: true })
  @JoinColumn({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' })
  reason: RapReason;

  @Column({ name: 'PaymentReceiptNumber', type: 'varchar', length: 50, nullable: true })
  paymentReceiptNumber: string;

  @Column({ name: 'PaymentReceiptDate', type: 'date', nullable: true })
  paymentReceiptDate: Date;

  @Column({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  amount: number;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;
}
