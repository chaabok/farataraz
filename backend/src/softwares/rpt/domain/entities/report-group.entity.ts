import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ name: 'ReportGroup', schema: 'Rpt' })
export class ReportGroup extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportGroupID: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;
}
