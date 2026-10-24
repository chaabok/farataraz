import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ServiceSupplyRequestDetail } from './service-supply-request-detail.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';

@Entity({ schema: 'Inv', name: 'ServiceSupplyRequests' })
export class ServiceSupplyRequest extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ServiceSupplyRequestID: number;

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

  @ManyToOne(() => DetailedAccount, { nullable: true })
  @JoinColumn({ name: 'RequesterRef' })
  requesterAccount?: DetailedAccount;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef?: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description?: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => ServiceSupplyRequestDetail, (detail) => detail.serviceSupplyRequest, { cascade: true })
  details?: ServiceSupplyRequestDetail[];
}
