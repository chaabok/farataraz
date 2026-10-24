import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';

@Entity({ name: 'ReportFormula', schema: 'Rpt' })
export class ReportFormula extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportFormulaID: string;

  @Column({ name: 'ReportRef', type: 'bigint', nullable: false })
  reportRef: string;

  @ManyToOne(() => Report, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ReportRef', referencedColumnName: 'reportID' })
  reportEntity?: Report;

  @Column({ type: 'varchar', length: 255, nullable: true })
  formulaName: string;

  @Column({ type: 'text', nullable: true })
  expression: string;
}
