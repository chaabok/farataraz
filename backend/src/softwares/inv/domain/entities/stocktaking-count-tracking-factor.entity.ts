import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StocktakingCountDetail } from './stocktaking-count-detail.entity';
import { TrackingFactor } from './tracking-factor.entity';

@Entity({ schema: 'Inv', name: 'StocktakingCountTrackingFactors' })
export class StocktakingCountTrackingFactor {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingCountTrackingFactorID: number;

  @Column({ type: 'bigint' })
  StocktakingCountDetailRef: number;

  @ManyToOne(() => StocktakingCountDetail, (d) => d.trackingFactors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'StocktakingCountDetailRef' })
  countDetail?: StocktakingCountDetail;

  @Column({ type: 'bigint' })
  TrackingFactorRef: number;

  @ManyToOne(() => TrackingFactor, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'TrackingFactorRef' })
  trackingFactor?: TrackingFactor;

  @Column({ type: 'varchar', length: 255, nullable: true })
  FactorValue?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  CountedQuantity: number;
}
