import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'ItemAccountCategories' })
export class ItemAccountCategory extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemAccountCategoryID: number;

  @Column({ type: 'int', nullable: true })
  ItemAccountCategoryCode: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ItemAccountCategoryName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ItemAccountCategoryName2: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  PricingMethod: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  StandardRate: number;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  // SlAccount References
  @Column({ type: 'bigint', nullable: true })
  InventorySlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  IndividualPurchaseSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  CorporatePurchaseSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  FreightSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  SuspensePurchaseSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  ForeignPurchaseSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  ScrapExpenseSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  ConsignmentOursSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  ConsignmentOthersSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  ConsignmentOffsetSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  IndividualPrepaymentSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  CorporatePrepaymentSlAccountRef: number;

  @Column({ type: 'bigint', nullable: true })
  ScrapIncomeSlAccountRef: number;
}
