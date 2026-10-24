import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Sle', name: 'SalesAccountCategories' })
export class SalesAccountCategory extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesAccountCategoryID: number;

  @Column({ type: 'int', nullable: true })
  SalesAccountCategoryCode: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  SalesAccountCategoryName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  SalesAccountCategoryName2: string;

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
  CurrencyRef: number;
}
