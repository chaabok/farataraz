import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemType, PricingMethod, TaxAndDutyExemption } from '../enums/item.enums';
import { MeasurementUnit } from './measurement-unit.entity';
import { ItemAccountCategory } from './item-account-category.entity';

@Entity({ schema: 'Inv', name: 'Items' })
export class Item extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemID: number;

  @Column({ type: 'int', default: ItemType.GOODS })
  ItemType: number;

  @Column({ type: 'int', nullable: true })
  ItemCode: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ItemName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  ItemName2: string;

  @Column({ type: 'bigint', nullable: true })
  MeasurementUnitRef: number;

  @ManyToOne(() => MeasurementUnit, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'MeasurementUnitRef' })
  MeasurementUnit?: MeasurementUnit;

  @Column({ type: 'text', nullable: true })
  TechnicalSpecification: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  DetailedAccountCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  TaxRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  DutyRate: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  IranCode: string;

  @Column({ type: 'bigint', nullable: true })
  ItemAccountCategoryRef: number;

  @ManyToOne(() => ItemAccountCategory, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemAccountCategoryRef' })
  ItemAccountCategory?: ItemAccountCategory;

  @Column({ type: 'int', default: PricingMethod.WEIGHTED_AVERAGE })
  PricingMethod: number;

  @Column({ type: 'int', default: TaxAndDutyExemption.NONE })
  TaxAndDutyExemption: number;

  @Column({ type: 'boolean', default: true })
  IsSalable: boolean;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;
}
