import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TemporaryItemReceiptDetail } from './temporary-item-receipt-detail.entity';

@Entity({ schema: 'Inv', name: 'TemporaryItemReceiptTrackingFactors' })
export class TemporaryItemReceiptTrackingFactor extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  TemporaryItemReceiptTrackingFactorID: number;

  @Column({ type: 'bigint' })
  TemporaryItemReceiptDetailRef: number;

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

  @ManyToOne(() => TemporaryItemReceiptDetail, (detail) => detail.trackingFactors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'TemporaryItemReceiptDetailRef' })
  temporaryItemReceiptDetail?: TemporaryItemReceiptDetail;
}
