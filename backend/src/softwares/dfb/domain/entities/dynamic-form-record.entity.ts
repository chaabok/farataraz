import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DynamicForm } from './dynamic-form.entity';

@Entity({ schema: 'Dfb', name: 'DynamicFormRecord' })
export class DynamicFormRecord extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint', name: 'DynamicFormRecordID' })
  dynamicFormRecordId: number;

  @Column({ type: 'bigint', name: 'FormRef' })
  formRef: number;

  @ManyToOne(() => DynamicForm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'FormRef' })
  form: DynamicForm;

  @Column({ type: 'jsonb', name: 'Data', default: '{}' })
  data: any;
}
