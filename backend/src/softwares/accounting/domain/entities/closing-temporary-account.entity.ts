import { Entity, PrimaryColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ClosingTemporaryAccountItem } from './closing-temporary-account-item.entity';
import { ClosingTemporaryAccountSelected } from './closing-temporary-account-selected.entity';

@Entity({ schema: 'Acc', name: 'ClosingTemporaryAccount' })
export class ClosingTemporaryAccount extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint',
    name: 'ClosingTemporaryAccountID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  id: number;

  @Column({ name: 'Description', type: 'varchar', length: 250, nullable: true })
  description: string;

  @Column({ name: 'ToDate', type: 'varchar', length: 10, nullable: true })
  toDate: string;

  @Column({ name: 'Type', type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ name: 'Status', type: 'varchar', length: 50, nullable: true })
  status: string;

  @Column({ name: 'VoucherRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  voucherRef: number | null;

  @OneToMany(() => ClosingTemporaryAccountItem, item => item.parent, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  items: ClosingTemporaryAccountItem[];

  @OneToMany(() => ClosingTemporaryAccountSelected, sel => sel.parent, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  selectedAccounts: ClosingTemporaryAccountSelected[];
}
