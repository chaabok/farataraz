import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Generated, Check, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedType } from './detailed-type.entity';

@Entity({ schema: 'Acc', name: 'DetailedAccounts' })
@Check('length("Code") > 0')
export class DetailedAccount extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'DetailedAccountID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    detailedAccountId: number;

  @Column({ name: 'Code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 100, nullable: true })
  title_en: string;

  @Column({ name: 'DetailedTypesID', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  detailedTypesId: number;

  @ManyToOne(() => DetailedType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedTypesID' })
  detailedType: DetailedType;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'isActive', type: 'boolean', default: true, nullable: false })
  isActive: boolean;
}
