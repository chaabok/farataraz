import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { StocktakingSettingWarehouse } from './stocktaking-setting-warehouse.entity';

@Entity({ schema: 'Inv', name: 'StocktakingSettings' })
export class StocktakingSetting extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingSettingID: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  MethodName: string;

  @Column({ type: 'int', default: 1 })
  CountTimes: number;

  @Column({ type: 'boolean', default: false })
  CountWithTrackingFactors: boolean;

  // Count 1
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Count1MinQty: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Count1MinRial: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Count1MinTurnover: number;

  // Count 2
  @Column({ type: 'varchar', length: 50, default: 'all_first' })
  Count2ListType: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Count2DiscrepancyPercent: number;

  // Count 3
  @Column({ type: 'varchar', length: 10, default: 'OR' })
  Count3CombineType: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Count3DiscrepancyPercent: number;

  @Column({ type: 'boolean', default: false })
  Count3Discrepancy1And2: boolean;

  @Column({ type: 'boolean', default: false })
  Count3Discrepancy1AndInv: boolean;

  @Column({ type: 'boolean', default: false })
  Count3Discrepancy2AndInv: boolean;

  @OneToMany(() => StocktakingSettingWarehouse, (w) => w.stocktakingSetting, { cascade: true })
  warehouses?: StocktakingSettingWarehouse[];
}
