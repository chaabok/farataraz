import { Entity, PrimaryColumn, Column } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Rap', name: 'ChequePrintTemplates' })
export class ChequePrintTemplate extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ChequePrintTemplateID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  chequePrintTemplateId: number;

  @Column({ name: 'BankRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankRef: number;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'ImageBlob', type: 'text', nullable: true })
  imageBlob: string;

  @Column({ name: 'Config', type: 'jsonb', nullable: false, default: {} })
  config: any;
}
