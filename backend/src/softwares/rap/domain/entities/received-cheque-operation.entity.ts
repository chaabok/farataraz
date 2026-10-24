import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankAccount } from './bank-account.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
import { ReceivedChequeOperationItem } from './received-cheque-operation-item.entity';

@Entity({ schema: 'Rap', name: 'ReceivedChequeOperation' })
export class ReceivedChequeOperation extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ReceivedChequeOperationID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  receivedChequeOperationId: number;

  @Column({ name: 'OperationType', type: 'int', nullable: false })
  operationType: number; // 1: Assign to bank, 2: Realize/Protest, 3: Cash & deposit, 4: Cash

  @Column({ name: 'DocumentNumber', type: 'varchar', length: 50, nullable: false })
  documentNumber: string;

  @Column({ name: 'DocumentDate', type: 'varchar', length: 20, nullable: false })
  documentDate: string;

  @Column({ name: 'AssignmentNumber', type: 'varchar', length: 50, nullable: true })
  assignmentNumber: string;

  @Column({ name: 'Status', type: 'int', nullable: false, default: 1 })
  status: number;

  @Column({ name: 'BankAccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  bankAccountRef: number | null;

  @ManyToOne(() => BankAccount, { eager: true, nullable: true })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ name: 'RealizerRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  realizerRef: number | null;

  @ManyToOne(() => DetailedAccount, { eager: false, nullable: true })
  @JoinColumn({ name: 'RealizerRef', referencedColumnName: 'detailedAccountId' })
  realizer: DetailedAccount;

  @Column({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  voucherHeaderRef: number | null;

  @ManyToOne(() => Voucher, { eager: false, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' })
  voucherHeader: Voucher;

  @OneToMany(() => ReceivedChequeOperationItem, item => item.operation, { cascade: true, orphanedRowAction: 'delete' })
  items: ReceivedChequeOperationItem[];

  @Column({ name: 'FiscalYearRef', type: 'bigint', nullable: false })
  fiscalYearRef: number;
}
