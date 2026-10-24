import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ItemRequest } from './item-request.entity';
import { Item } from './item.entity';
import { ItemRequestTrackingFactor } from './item-request-tracking-factor.entity';

@Entity({ schema: 'Inv', name: 'ItemRequestDetails' })
export class ItemRequestDetail {
  @PrimaryColumn({ type: 'bigint' })
  ItemRequestDetailID: number;

  @Column({ type: 'bigint' })
  ItemRequestRef: number;

  @Column({ type: 'int' })
  RowNo: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  RequestQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  ApprovedQuantity: number;

  @Column({ type: 'timestamp', nullable: true })
  DeliveryDate?: Date | string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @Column({ type: 'jsonb', nullable: true })
  TrackingFactorValues?: any;

  @ManyToOne(() => ItemRequest, (req) => req.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ItemRequestRef' })
  itemRequest?: ItemRequest;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

  @OneToMany(() => ItemRequestTrackingFactor, (tf) => tf.itemRequestDetail, { cascade: true })
  trackingFactors?: ItemRequestTrackingFactor[];
}
