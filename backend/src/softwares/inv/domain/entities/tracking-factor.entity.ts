import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TrackingFactorItemRelated } from './tracking-factor-item-related.entity';
import { TrackingFactorConstantValue } from './tracking-factor-constant-value.entity';

@Entity({ schema: 'Inv', name: 'TrackingFactors' })
export class TrackingFactor extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  TrackingFactorID: number;

  @Column({ type: 'bigint', nullable: true })
  TrackingFactorCode: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  TrackingFactorName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  TrackingFactorName2: string | null;

  @Column({ type: 'int', default: 1 })
  TrackingFactorType: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  StartValue: string | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  EndValue: string | null;

  @Column({ type: 'boolean', default: false })
  IsConstantValue: boolean;

  @Column({ type: 'int', default: 1 })
  DisplayPriority: number;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @OneToMany(() => TrackingFactorItemRelated, (related) => related.trackingFactor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  relatedItems: TrackingFactorItemRelated[];

  @OneToMany(() => TrackingFactorConstantValue, (cv) => cv.trackingFactor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  constantValues: TrackingFactorConstantValue[];
}
