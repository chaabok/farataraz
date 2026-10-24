import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { StocktakingCount } from './stocktaking-count.entity';
import { Item } from './item.entity';
import { StocktakingCountTrackingFactor } from './stocktaking-count-tracking-factor.entity';

@Entity({ schema: 'Inv', name: 'StocktakingCountDetails' })
export class StocktakingCountDetail {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingCountDetailID: number;

  @Column({ type: 'bigint' })
  StocktakingCountRef: number;

  @ManyToOne(() => StocktakingCount, (c) => c.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'StocktakingCountRef' })
  count?: StocktakingCount;

  @Column({ type: 'int' })
  RowNumber: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

  @Column({ type: 'varchar', length: 100, nullable: true })
  TagNumber?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  CountedQuantity: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @OneToMany(() => StocktakingCountTrackingFactor, (tf) => tf.countDetail, { cascade: true })
  trackingFactors?: StocktakingCountTrackingFactor[];
}
