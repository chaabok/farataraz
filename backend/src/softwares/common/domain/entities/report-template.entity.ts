import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Gnr', name: 'ReportTemplate' })
export class ReportTemplate extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint', 
    name: 'ReportTemplateID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  reportTemplateID: number;

  @Column({ type: 'varchar', length: 255, name: 'Title' })
  title: string;

  @Column({ type: 'varchar', length: 100, name: 'Category', nullable: true })
  category: string;

  @Column({ type: 'boolean', name: 'IsLocked', default: false })
  isLocked: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'UnlockPrice', default: 0 })
  unlockPrice: number;

  @Column({ type: 'text', name: 'LayoutConfig', nullable: true })
  layoutConfig: string;

  @Column({ type: 'text', name: 'QuerySql', nullable: true })
  querySql: string;
}
