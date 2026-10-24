import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankReconciliation } from './bank-reconciliation.entity';
import { ReconcileBankStatementItem } from './reconcile-bank-statement-item.entity';

@Entity('BankReconciliationItem', { schema: 'Rap' })
export class BankReconciliationItem extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  BankReconciliationItemID: number;

  @Column({ type: 'bigint', nullable: false })
  BankReconciliationRef: number;

  @ManyToOne(() => BankReconciliation, (br) => br.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'BankReconciliationRef', referencedColumnName: 'BankReconciliationID' })
  bankReconciliation: BankReconciliation;

  @Column({ type: 'bigint', nullable: true })
  BankStatementItemRef: number;

  @ManyToOne(() => ReconcileBankStatementItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankStatementItemRef', referencedColumnName: 'ReconcileBankStatementItemID' })
  bankStatementItem: ReconcileBankStatementItem;

  @Column({ type: 'varchar', length: 250, nullable: true })
  BookItemRef: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matchId: string;
}
