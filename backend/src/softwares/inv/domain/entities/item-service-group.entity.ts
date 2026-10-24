import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemServiceGroupField } from './item-service-group-field.entity';
import { ItemServiceGroupRelatedProduct } from './item-service-group-related-product.entity';

@Entity({ schema: 'Inv', name: 'ItemServiceGroups' })
export class ItemServiceGroup extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemServiceGroupID: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ItemServiceGroupCode: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ItemServiceGroupName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ItemServiceGroupName2: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;

  @Column({ type: 'boolean', default: false })
  IsMandatory: boolean;

  @Column({ type: 'bigint', nullable: true })
  ParentRef: number | null;

  @ManyToOne(() => ItemServiceGroup, (group) => group.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ParentRef', referencedColumnName: 'ItemServiceGroupID' })
  parent?: ItemServiceGroup;

  @OneToMany(() => ItemServiceGroup, (group) => group.parent)
  children?: ItemServiceGroup[];

  @OneToMany(() => ItemServiceGroupField, (field) => field.itemServiceGroup, { cascade: true })
  fields?: ItemServiceGroupField[];

  @OneToMany(() => ItemServiceGroupRelatedProduct, (prod) => prod.itemServiceGroup, { cascade: true })
  relatedProducts?: ItemServiceGroupRelatedProduct[];
}
