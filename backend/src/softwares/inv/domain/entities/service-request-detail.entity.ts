import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceRequest } from './service-request.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'ServiceRequestDetails' })
export class ServiceRequestDetail {
  @PrimaryColumn({ type: 'bigint' })
  ServiceRequestDetailID: number;

  @Column({ type: 'bigint' })
  ServiceRequestRef: number;

  @Column({ type: 'int' })
  RowNo: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  RequestQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  ApprovedQuantity: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  DeliveryDate?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @ManyToOne(() => ServiceRequest, (req) => req.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ServiceRequestRef' })
  serviceRequest?: ServiceRequest;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;
}
