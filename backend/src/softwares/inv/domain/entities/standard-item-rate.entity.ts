import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'StandardItemRates' })
export class StandardItemRate extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  StandardItemRateID: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @Column({ type: 'bigint', nullable: true })
  ItemAccountCategoryRef: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  EffectiveDate: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
