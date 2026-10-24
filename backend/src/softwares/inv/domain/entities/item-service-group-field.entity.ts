import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemServiceGroup } from './item-service-group.entity';

@Entity({ schema: 'Inv', name: 'ItemServiceGroupFields' })
export class ItemServiceGroupField extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemServiceGroupFieldID: number;

  @Column({ type: 'bigint' })
  ItemServiceGroupRef: number;

  @ManyToOne(() => ItemServiceGroup, (group) => group.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ItemServiceGroupRef', referencedColumnName: 'ItemServiceGroupID' })
  itemServiceGroup?: ItemServiceGroup;

  @Column({ type: 'varchar', length: 150 })
  FieldTitle: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  FieldTitle2: string;

  @Column({ type: 'int', default: 1 })
  FieldType: number;

  @Column({ type: 'boolean', default: false })
  IsRequired: boolean;

  @Column({ type: 'text', nullable: true })
  Options: string;

  @Column({ type: 'int', default: 1 })
  RowNo: number;
}
