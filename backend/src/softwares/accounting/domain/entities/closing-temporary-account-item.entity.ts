import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ClosingTemporaryAccount } from './closing-temporary-account.entity';

@Entity({ schema: 'Acc', name: 'ClosingTemporaryAccountItem' })
export class ClosingTemporaryAccountItem extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint',
    name: 'ClosingTemporaryAccountItemID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  id: number;

  @Column({ name: 'ClosingTemporaryAccountRef', type: 'bigint' })
  closingTemporaryAccountRef: number;

  @ManyToOne(() => ClosingTemporaryAccount, parent => parent.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ClosingTemporaryAccountRef' })
  parent: ClosingTemporaryAccount;

  @Column({ name: 'IntermediaryAccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  intermediaryAccountRef: number | null;

  @Column({ name: 'IntermediaryCode', type: 'varchar', length: 20, nullable: true })
  intermediaryCode: string;

  @Column({ name: 'Percentage', type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseFloat(value) : null
  }})
  percentage: number;

  @Column({ name: 'DetailedAccountRef1', type: 'bigint', nullable: true })
  detailedAccountRef1: number | null;

  @Column({ name: 'DetailedAccountRef2', type: 'bigint', nullable: true })
  detailedAccountRef2: number | null;

  @Column({ name: 'DetailedAccountRef3', type: 'bigint', nullable: true })
  detailedAccountRef3: number | null;
}
