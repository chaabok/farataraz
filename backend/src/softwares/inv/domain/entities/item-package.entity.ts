import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemType } from '../enums/item.enums';
import { MeasurementUnit } from './measurement-unit.entity';
import { ItemPackageDetail } from './item-package-detail.entity';

@Entity({ schema: 'Inv', name: 'ItemPackages' })
export class ItemPackage extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemPackageID: number;

  @Column({ type: 'int', default: ItemType.GOODS })
  ItemType: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  PackageCode: string;

  @Column({ type: 'varchar', length: 250 })
  PackageTitle: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  PackageTitle2: string;

  @Column({ type: 'bigint', nullable: true })
  MeasurementUnitRef: number;

  @ManyToOne(() => MeasurementUnit, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'MeasurementUnitRef' })
  MeasurementUnit?: MeasurementUnit;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  Quantity: number;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => ItemPackageDetail, (detail) => detail.ItemPackage, { cascade: true })
  Details?: ItemPackageDetail[];
}
