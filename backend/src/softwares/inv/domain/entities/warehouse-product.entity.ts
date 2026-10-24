import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { MeasurementUnit } from './measurement-unit.entity';

@Entity({ schema: 'Inv', name: 'WarehouseProducts' })
export class WarehouseProduct extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseProductID: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, w => w.WarehouseProducts, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseRef' })
  Warehouse: Warehouse;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ProductCode: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ProductTitle: string;

  @Column({ type: 'bigint', nullable: true })
  MeasurementUnitRef: number;

  @ManyToOne(() => MeasurementUnit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'MeasurementUnitRef' })
  MeasurementUnit: MeasurementUnit;
}
