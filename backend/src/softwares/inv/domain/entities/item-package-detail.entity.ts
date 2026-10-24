import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemPackage } from './item-package.entity';
import { Item } from './item.entity';
import { MeasurementUnit } from './measurement-unit.entity';

@Entity({ schema: 'Inv', name: 'ItemPackageDetails' })
export class ItemPackageDetail extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemPackageDetailID: number;

  @Column({ type: 'bigint' })
  ItemPackageRef: number;

  @ManyToOne(() => ItemPackage, (pkg) => pkg.Details, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemPackageRef' })
  ItemPackage?: ItemPackage;

  @Column({ type: 'int', default: 1 })
  RowNo: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  Item?: Item;

  @Column({ type: 'bigint', nullable: true })
  MeasurementUnitRef: number;

  @ManyToOne(() => MeasurementUnit, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'MeasurementUnitRef' })
  MeasurementUnit?: MeasurementUnit;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  Quantity: number;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;
}
