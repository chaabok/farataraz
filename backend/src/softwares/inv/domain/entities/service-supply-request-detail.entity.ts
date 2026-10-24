import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceSupplyRequest } from './service-supply-request.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'ServiceSupplyRequestDetails' })
export class ServiceSupplyRequestDetail {
  @PrimaryColumn({ type: 'bigint' })
  ServiceSupplyRequestDetailID: number;

  @Column({ type: 'bigint' })
  ServiceSupplyRequestRef: number;

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

  @ManyToOne(() => ServiceSupplyRequest, (req) => req.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ServiceSupplyRequestRef' })
  serviceSupplyRequest?: ServiceSupplyRequest;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;
}
