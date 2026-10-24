import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'StandardItemRateDetails' })
export class StandardItemRateDetail extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  StandardItemRateDetailID: number;

  @Column({ type: 'bigint' })
  StandardItemRateRef: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  UnitRate: number;
}
