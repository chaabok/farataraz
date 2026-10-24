import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ServiceRequestDetail } from './service-request-detail.entity';

export enum SupplyRequestBaseType {
  None = 1,
  InventoryControl = 2,
  ItemRequest = 3,
}

@Entity({ schema: 'Inv', name: 'ServiceRequests' })
export class ServiceRequest extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ServiceRequestID: number;

  @Column({ type: 'int', default: SupplyRequestBaseType.None })
  BaseSource: number;

  @Column({ type: 'bigint' })
  RequestNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  RequestDate: Date | string;

  @Column({ type: 'int', default: 1 })
  Priority: number;

  @Column({ type: 'int', default: 1 })
  Status: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  Requester: string;

  @Column({ type: 'bigint', nullable: true })
  RequesterRef?: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description?: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => ServiceRequestDetail, (detail) => detail.serviceRequest, { cascade: true })
  details?: ServiceRequestDetail[];
}
