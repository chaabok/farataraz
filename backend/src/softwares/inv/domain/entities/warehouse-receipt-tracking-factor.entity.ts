import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { WarehouseReceiptDetail } from './warehouse-receipt-detail.entity';

@Entity({ schema: 'Inv', name: 'WarehouseReceiptTrackingFactors' })
export class WarehouseReceiptTrackingFactor extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseReceiptTrackingFactorID: number;

  @Column({ type: 'bigint' })
  WarehouseReceiptDetailRef: number;

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

  @ManyToOne(() => WarehouseReceiptDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'WarehouseReceiptDetailRef' })
  warehouseReceiptDetail?: WarehouseReceiptDetail;
}
