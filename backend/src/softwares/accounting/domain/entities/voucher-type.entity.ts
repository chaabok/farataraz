import { Entity, PrimaryColumn, Column , Generated, Unique, Check} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Acc', name: 'VoucherType' })
@Check('"Code" >= 0')
export class VoucherType extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'VoucherTypeID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    voucherTypeId: number;

  @Column({ 
    name: 'Code', 
    type: 'bigint', 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  code: number;

  @Column({ name: 'Title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 255, nullable: true })
  title_en: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;
}
