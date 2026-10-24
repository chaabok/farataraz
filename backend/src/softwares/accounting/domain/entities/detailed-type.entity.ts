import { Entity, PrimaryColumn, Column , Generated, Unique, Check} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Acc', name: 'DetailedTypes' })
@Check('length("Code") > 0')
export class DetailedType extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'DetailedTypesID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    detailedTypesId: number;

  @Column({ name: 'Code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 50, nullable: true })
  title_en: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'isActive', type: 'boolean', default: true, nullable: false })
  isActive: boolean;
}
