import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';

@Entity({ name: 'ReportSorting', schema: 'Rpt' })
export class ReportSorting extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportSortingID: string;

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
  sortDirection: string;

  @Column({ type: 'int', nullable: true })
  orderIndex: number;
}
