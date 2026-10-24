import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';

@Entity({ schema: 'Inv', name: 'ItemPhysicalLocations' })
export class ItemPhysicalLocation extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemPhysicalLocationID: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  Item: Item;

  @Column({ type: 'bigint' })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseRef' })
  Warehouse: Warehouse;

  @Column({ type: 'boolean', default: false })
  IsDefault: boolean;
}
