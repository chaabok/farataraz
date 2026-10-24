import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReportGroup } from './report-group.entity';

@Entity({ name: 'Report', schema: 'Rpt' })
export class Report extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportID: string;

  @Column({ name: 'ReportGroupRef', type: 'bigint', nullable: true })
  reportGroupRef: string;

  @ManyToOne(() => ReportGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ReportGroupRef', referencedColumnName: 'reportGroupID' })
  reportGroupEntity?: ReportGroup;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  direction: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paperSize: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paperOrientation: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  showInstitutionName: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  showDate: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  showRowNumber: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  showFilters: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pageNumberType: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  showLogo: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  hideDuplicates: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dataSourceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryTable: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  targetForm: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  isDefaultTemplate: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  isSystemReport: boolean;

  @Column({ type: 'text', nullable: true })
  sqlScript: string;
}
