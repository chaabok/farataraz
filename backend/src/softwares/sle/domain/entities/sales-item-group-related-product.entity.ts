import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesItemGroup } from './sales-item-group.entity';

@Entity({ schema: 'Sle', name: 'SalesItemGroupRelatedProducts' })
export class SalesItemGroupRelatedProduct extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesItemGroupRelatedProductID: number;

  @Column({ type: 'bigint' })
  SalesItemGroupRef: number;

  @ManyToOne(() => SalesItemGroup, (group) => group.relatedProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SalesItemGroupRef', referencedColumnName: 'SalesItemGroupID' })
  salesItemGroup: SalesItemGroup;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ProductCode: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ProductName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Unit: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
