import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StocktakingTagHeader } from './stocktaking-tag-header.entity';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'StocktakingTagDetails' })
export class StocktakingTagDetail {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingTagDetailID: number;

  @Column({ type: 'bigint' })
  StocktakingTagHeaderRef: number;

  @ManyToOne(() => StocktakingTagHeader, (h) => h.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'StocktakingTagHeaderRef' })
  header?: StocktakingTagHeader;

  @Column({ type: 'bigint' })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseRef' })
  warehouse?: Warehouse;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

  @Column({ type: 'varchar', length: 100, nullable: true })
  TagNumber: string;
}
