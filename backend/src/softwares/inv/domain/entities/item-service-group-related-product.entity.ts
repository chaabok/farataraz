import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemServiceGroup } from './item-service-group.entity';

@Entity({ schema: 'Inv', name: 'ItemServiceGroupRelatedProducts' })
export class ItemServiceGroupRelatedProduct extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemServiceGroupRelatedProductID: number;

  @Column({ type: 'bigint' })
  ItemServiceGroupRef: number;

  @ManyToOne(() => ItemServiceGroup, (group) => group.relatedProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ItemServiceGroupRef', referencedColumnName: 'ItemServiceGroupID' })
  itemServiceGroup?: ItemServiceGroup;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ProductCode: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ProductName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Unit: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
