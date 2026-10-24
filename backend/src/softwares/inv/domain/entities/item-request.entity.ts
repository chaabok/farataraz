import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemRequestDetail } from './item-request-detail.entity';

@Entity({ schema: 'Inv', name: 'ItemRequests' })
export class ItemRequest extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemRequestID: number;

  @Column({ type: 'int', default: 1 })
  BasisType: number;

  @Column({ type: 'bigint' })
  RequestNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  RequestDate: Date | string;

  @Column({ type: 'int', default: 1, nullable: true })
  RequestType?: number;

  @Column({ type: 'int', default: 1 })
  Priority: number;

  @Column({ type: 'int', default: 1 })
  Status: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  Requester: string;

  @Column({ type: 'bigint', nullable: true })
  RequesterRef?: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef?: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description?: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => ItemRequestDetail, (detail) => detail.itemRequest, { cascade: true })
  details?: ItemRequestDetail[];
}
