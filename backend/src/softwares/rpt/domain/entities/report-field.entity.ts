import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';

@Entity({ name: 'ReportField', schema: 'Rpt' })
export class ReportField extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportFieldID: string;

  @Column({ name: 'ReportRef', type: 'bigint', nullable: false })
  reportRef: string;

  @ManyToOne(() => Report, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ReportRef', referencedColumnName: 'reportID' })
  reportEntity?: Report;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tableName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fieldName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alias: string;

  @Column({ type: 'int', nullable: true })
  orderIndex: number;

  @Column({ type: 'boolean', default: true, nullable: true })
  isVisible: boolean;
}
