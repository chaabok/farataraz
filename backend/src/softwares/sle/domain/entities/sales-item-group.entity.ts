import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesItemGroupRelatedProduct } from './sales-item-group-related-product.entity';

@Entity({ schema: 'Sle', name: 'SalesItemGroups' })
export class SalesItemGroup extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesItemGroupID: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  SalesItemGroupCode: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  SalesItemGroupName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  SalesItemGroupName2: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;

  @Column({ type: 'boolean', default: false })
  IsMandatory: boolean;

  @Column({ type: 'bigint', nullable: true })
  ParentRef: number | null;

  @ManyToOne(() => SalesItemGroup, (group) => group.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ParentRef', referencedColumnName: 'SalesItemGroupID' })
  parent?: SalesItemGroup;

  @OneToMany(() => SalesItemGroup, (group) => group.parent)
  children?: SalesItemGroup[];

  @OneToMany(() => SalesItemGroupRelatedProduct, (prod) => prod.salesItemGroup, { cascade: true })
  relatedProducts?: SalesItemGroupRelatedProduct[];
}
