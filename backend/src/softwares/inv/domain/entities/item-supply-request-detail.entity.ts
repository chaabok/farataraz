import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ItemSupplyRequest } from './item-supply-request.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'ItemSupplyRequestDetails' })
export class ItemSupplyRequestDetail {
  @PrimaryColumn({ type: 'bigint' })
  ItemSupplyRequestDetailID: number;

  @Column({ type: 'bigint' })
  ItemSupplyRequestRef: number;

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

  @ManyToOne(() => ItemSupplyRequest, (req) => req.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ItemSupplyRequestRef' })
  itemSupplyRequest?: ItemSupplyRequest;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;
}
