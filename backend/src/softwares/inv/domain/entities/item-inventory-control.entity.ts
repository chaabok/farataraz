import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'ItemInventoryControls' })
export class ItemInventoryControl extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemInventoryControlID: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  Item: Item;

  @Column({ type: 'varchar', length: 10, nullable: true })
  EffectiveDate: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  MinQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  MaxQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  OrderQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  ReorderPoint: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
