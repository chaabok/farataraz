import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StocktakingSetting } from './stocktaking-setting.entity';
import { Warehouse } from './warehouse.entity';

@Entity({ schema: 'Inv', name: 'StocktakingSettingWarehouses' })
export class StocktakingSettingWarehouse {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingSettingWarehouseID: number;

  @Column({ type: 'bigint' })
  StocktakingSettingRef: number;

  @ManyToOne(() => StocktakingSetting, (setting) => setting.warehouses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'StocktakingSettingRef' })
  stocktakingSetting?: StocktakingSetting;

  @Column({ type: 'bigint' })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseRef' })
  warehouse?: Warehouse;
}
