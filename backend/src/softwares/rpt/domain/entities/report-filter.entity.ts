import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';

@Entity({ name: 'ReportFilter', schema: 'Rpt' })
export class ReportFilter extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportFilterID: string;

  @Column({ name: 'ReportRef', type: 'bigint', nullable: false })
  reportRef: string;

  @ManyToOne(() => Report, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ReportRef', referencedColumnName: 'reportID' })
  reportEntity?: Report;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tableName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fieldName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  operator: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  valueType: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  logicalOperator: string;

  @Column({ type: 'int', nullable: true })
  orderIndex: number;
}
