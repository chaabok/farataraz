import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaidDocumentClearingItem } from './paid-document-clearing-item.entity';
import { BankAccount } from './bank-account.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';

@Entity({ schema: 'Rap', name: 'PaidDocumentClearing' })
export class PaidDocumentClearing extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaidDocumentClearingID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  paidDocumentClearingId: number;

  @Column({ name: 'Number', type: 'varchar', length: 50, nullable: false })
  number: string;

  @Column({ name: 'Date', type: 'varchar', length: 20, nullable: false })
  date: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'Status', type: 'int', default: 2 })
  status: number;

  @Column({ name: 'FiscalYearRef', type: 'bigint', nullable: false })
  fiscalYearRef: number;

  @Column({ name: 'BankAccountRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  bankAccountRef: number;

  @ManyToOne(() => BankAccount, { eager: true, nullable: true })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  voucherHeaderRef: number | null;

  @ManyToOne(() => Voucher, { eager: false, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' })
  voucherHeader: Voucher;

  @OneToMany(() => PaidDocumentClearingItem, item => item.paidDocumentClearing, { cascade: true, orphanedRowAction: 'delete' })
  items: PaidDocumentClearingItem[];
}
