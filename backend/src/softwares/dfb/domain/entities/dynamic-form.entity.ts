import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Dfb', name: 'DynamicForm' })
export class DynamicForm extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint', name: 'DynamicFormID' })
  dynamicFormId: number;

  @Column({ type: 'varchar', name: 'FormCode', length: 100, unique: true })
  formCode: string;

  @Column({ type: 'varchar', name: 'Title', length: 255 })
  title: string;

  @Column({ type: 'varchar', name: 'Description', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', name: 'ComponentName', length: 100, nullable: true })
  componentName: string;

  @Column({ type: 'jsonb', name: 'Bands', nullable: true, default: '[]' })
  bands: any[];

  @Column({ type: 'jsonb', name: 'Fields', default: '[]' })
  fields: any[];

  @Column({ type: 'jsonb', name: 'Styles', default: '{}' })
  styles: any;

  @Column({ type: 'jsonb', name: 'MenuConfig', nullable: true, default: '{}' })
  menuConfig: any;

  @Column({ type: 'jsonb', name: 'Options', nullable: true, default: '{}' })
  options: any;

  @Column({ type: 'boolean', name: 'ShowPrintList', nullable: true, default: false })
  showPrintList: boolean;

  @Column({ type: 'boolean', name: 'ShowVoucherActionbar', nullable: true, default: false })
  showVoucherActionbar: boolean;

  @Column({ type: 'boolean', name: 'IsActive', default: true })
  isActive: boolean;
}
