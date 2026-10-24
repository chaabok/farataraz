import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';

@Entity({ name: 'ReportAggregate', schema: 'Rpt' })
export class ReportAggregate extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportAggregateID: string;

  @Column({ name: 'ReportRef', type: 'bigint', nullable: false })
  reportRef: string;

  @ManyToOne(() => Report, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ReportRef', referencedColumnName: 'reportID' })
  reportEntity?: Report;

  @Column({ type: 'varchar', length: 255, nullable: true })
  field: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  groupBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  printPosition: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  hasPageTotal: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  hasGrandTotal: boolean;
}
