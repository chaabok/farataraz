import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TrackingFactor } from './tracking-factor.entity';

@Entity({ schema: 'Inv', name: 'TrackingFactorConstantValue' })
export class TrackingFactorConstantValue extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  TrackingFactorConstantValueID: number;

  @Column({ type: 'bigint' })
  TrackingFactorRef: number;

  @Column({ type: 'int', nullable: true })
  RowNumber: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  ConstantValue: string;

  @ManyToOne(() => TrackingFactor, (tf) => tf.constantValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'TrackingFactorRef', referencedColumnName: 'TrackingFactorID' })
  trackingFactor: TrackingFactor;
}
