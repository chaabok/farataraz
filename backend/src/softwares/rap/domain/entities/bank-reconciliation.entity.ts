import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankAccount } from './bank-account.entity';
import { ReconcileBankStatement } from './reconcile-bank-statement.entity';
import { BankReconciliationItem } from './bank-reconciliation-item.entity';

@Entity('BankReconciliation', { schema: 'Rap' })
export class BankReconciliation extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  BankReconciliationID: number;

  @Column({ type: 'bigint', nullable: false })
  BankAccountRef: number;

  @ManyToOne(() => BankAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ type: 'bigint', nullable: false })
  ReconcileBankStatementRef: number;

  @ManyToOne(() => ReconcileBankStatement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ReconcileBankStatementRef', referencedColumnName: 'ReconcileBankStatementID' })
  bankStatement: ReconcileBankStatement;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Date: string;

  @Column({ type: 'boolean', default: false })
  isOpening: boolean;

  @OneToMany(() => BankReconciliationItem, item => item.bankReconciliation, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  items: BankReconciliationItem[];
}
