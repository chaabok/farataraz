import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';

@Entity({ name: 'ReportPermission', schema: 'Rpt' })
export class ReportPermission extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportPermissionID: string;

  @Column({ name: 'ReportRef', type: 'bigint', nullable: false })
  reportRef: string;

  @ManyToOne(() => Report, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ReportRef', referencedColumnName: 'reportID' })
  reportEntity?: Report;

  @Column({ type: 'bigint', nullable: true })
  userRef: string;

  @Column({ type: 'bigint', nullable: true })
  userGroupRef: string;

  @Column({ type: 'boolean', default: false })
  canView: boolean;

  @Column({ type: 'boolean', default: false })
  canEdit: boolean;

  @Column({ type: 'boolean', default: false })
  canDelete: boolean;
}
