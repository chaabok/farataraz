import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ name: 'ReportUserData', schema: 'Rpt' })
export class ReportUserData extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  reportUserDataID: string;

  @Column({ name: 'ReportName', type: 'varchar', length: 500, nullable: true })
  reportName: string;

  @Column({ name: 'DynamicKey', type: 'varchar', length: 100 })
  dynamicKey: string;

  @Column({ name: 'Value', type: 'text', nullable: true })
  value: string;
}
