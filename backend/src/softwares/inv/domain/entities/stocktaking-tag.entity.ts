import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'StocktakingTags' })
export class StocktakingTag extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingTagID: number;

  @Column({ type: 'bigint' })
  StocktakingRef: number;

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
