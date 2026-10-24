import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TrackingFactor } from './tracking-factor.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'TrackingFactorItemRelated' })
export class TrackingFactorItemRelated extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  TrackingFactorItemRelatedID: number;

  @Column({ type: 'bigint' })
  TrackingFactorRef: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => TrackingFactor, (tf) => tf.relatedItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'TrackingFactorRef', referencedColumnName: 'TrackingFactorID' })
  trackingFactor: TrackingFactor;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ItemRef', referencedColumnName: 'ItemID' })
  item: Item;
}
