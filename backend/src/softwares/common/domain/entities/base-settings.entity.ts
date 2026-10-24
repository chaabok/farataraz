import { Entity, Column, PrimaryColumn, Generated, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Gnr', name: 'BaseSettings' })
@Index(['tabRef', 'key', 'businessStructureRef', 'companyRef'], { unique: true })
export class BaseSettings extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint', 
    name: 'BaseSettingsID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    baseSettingsID: number;

  @Column({ type: 'int', name: 'TabRef' })
  tabRef: number;

  @Column({ type: 'varchar', length: 50, name: 'Key' })
  key: string;

  @Column({ type: 'text', name: 'Value' })
  value: string;
}
