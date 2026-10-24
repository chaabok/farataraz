import { Entity, PrimaryColumn, Column , Generated, Unique, Check} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Acc', name: 'OtherDetails' })
export class OtherDetails extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'OtherDetailsID',
    transformer: {
      to: (value) => value,
      from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    otherDetailsId: number;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 150, nullable: true })
  title_en: string;

  @Column({ name: 'DetailedCode', type: 'bigint', nullable: true })
  detailedCode: number;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'isActive', type: 'boolean', default: true, nullable: false })
  isActive: boolean;
}
