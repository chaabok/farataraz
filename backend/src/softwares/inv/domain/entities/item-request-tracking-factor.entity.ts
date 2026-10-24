import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemRequestDetail } from './item-request-detail.entity';

@Entity({ schema: 'Inv', name: 'ItemRequestTrackingFactors' })
export class ItemRequestTrackingFactor extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemRequestTrackingFactorID: number;

  @Column({ type: 'bigint' })
  ItemRequestDetailRef: number;

  @Column({ type: 'bigint', nullable: true })
  TrackingFactorRef?: number;

  @Column({ type: 'int', nullable: true })
  TrackingFactorCode?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  TrackingFactorName?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Quantity: number;

  @Column({ type: 'text', nullable: true })
  FactorValue?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  StartValue?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  EndValue?: string;

  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;

  @ManyToOne(() => ItemRequestDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ItemRequestDetailRef' })
  itemRequestDetail?: ItemRequestDetail;
}
