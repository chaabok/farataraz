import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';
import { MeasurementUnit } from './measurement-unit.entity';

@Entity({ schema: 'Inv', name: 'ItemSubUnits' })
export class ItemSubUnit extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemSubUnitID: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  Item: Item;

  @Column({ type: 'bigint' })
  SubUnitRef: number;

  @ManyToOne(() => MeasurementUnit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'SubUnitRef' })
  SubUnit: MeasurementUnit;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  MainToSubRatio: number;

  @Column({ type: 'int', default: 2 })
  IsVariableRatio: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  TolerancePercent: number;
}
