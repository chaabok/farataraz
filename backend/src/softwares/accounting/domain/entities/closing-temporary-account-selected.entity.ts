import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ClosingTemporaryAccount } from './closing-temporary-account.entity';

@Entity({ schema: 'Acc', name: 'ClosingTemporaryAccountSelected' })
export class ClosingTemporaryAccountSelected extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint',
    name: 'ClosingTemporaryAccountSelectedID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  id: number;

  @Column({ name: 'ClosingTemporaryAccountRef', type: 'bigint' })
  closingTemporaryAccountRef: number;

  @ManyToOne(() => ClosingTemporaryAccount, parent => parent.selectedAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ClosingTemporaryAccountRef' })
  parent: ClosingTemporaryAccount;

  @Column({ name: 'AccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  accountRef: number | null;

  @Column({ name: 'AccountCode', type: 'varchar', length: 20, nullable: true })
  accountCode: string;

  @Column({ name: 'AccountTitle', type: 'varchar', length: 150, nullable: true })
  accountTitle: string;

  @Column({ name: 'DetailedAccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  detailedAccountRef: number | null;
}
