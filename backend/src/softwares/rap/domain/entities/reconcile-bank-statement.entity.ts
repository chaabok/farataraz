import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReconcileBankStatementItem } from './reconcile-bank-statement-item.entity';
import { BankAccount } from './bank-account.entity';

@Entity('ReconcileBankStatement', { schema: 'Rap' })
export class ReconcileBankStatement extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ReconcileBankStatementID: number;

  @Column({ type: 'bigint', nullable: true })
  BankAccountRef: number;

  @ManyToOne(() => BankAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Date: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fromDate: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 })
  previousBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 })
  balance: number;

  @Column({ type: 'bigint', nullable: true })
  fiscalYearRef: number;

  @OneToMany(() => ReconcileBankStatementItem, item => item.statement, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  items: ReconcileBankStatementItem[];
}
