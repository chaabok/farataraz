import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { PricingType } from '../enums/pricing-type.enum';

// Rule 8, 12, 13, 17: Primary key WarehouseVouchersPricingID (bigint), Enum for PricingType, Column Order
@Entity({ schema: 'Inv', name: 'WarehouseVouchersPricing' })
export class WarehouseVouchersPricing {
  // 1. Primary Key
  @PrimaryColumn({ type: 'bigint' })
  WarehouseVouchersPricingID: number;

  // 2. Main Business Fields
  @Column({ type: 'int', default: PricingType.Receipt })
  PricingType: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseVoucherRef?: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseVoucherDetailRef?: number;

  @Column({ type: 'bigint', nullable: true })
  ItemRef?: number;

  @ManyToOne(() => Item, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  item?: Item;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  UnitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Additions: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Deductions: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  NetPrice: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  // 3. Inherited & System Fields (Rule 17)
  @Column({ type: 'bigint', nullable: true })
  businessStructureRef?: number;

  @Column({ type: 'bigint', nullable: true })
  companyRef?: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @Column({ type: 'bigint', nullable: true })
  creator?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createTime?: string;

  @Column({ type: 'bigint', nullable: true })
  lastModifier?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastModificationTime?: string;
}
