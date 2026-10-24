import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReconcileBankStatement } from './reconcile-bank-statement.entity';

@Entity('ReconcileBankStatementItem', { schema: 'Rap' })
export class ReconcileBankStatementItem extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ReconcileBankStatementItemID: number;

  @Column({ type: 'bigint', nullable: true })
  ReconcileBankStatementRef: number;

  @ManyToOne(() => ReconcileBankStatement, statement => statement.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ReconcileBankStatementRef' })
  statement: ReconcileBankStatement;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  documentDate: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 })
  credit: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
