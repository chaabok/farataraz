import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { StocktakingTagHeader } from './stocktaking-tag-header.entity';
import { Warehouse } from './warehouse.entity';
import { StocktakingCountDetail } from './stocktaking-count-detail.entity';

@Entity({ schema: 'Inv', name: 'StocktakingCounts' })
export class StocktakingCount extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingCountID: number;

  @Column({ type: 'bigint' })
  StocktakingTagHeaderRef: number;

  @ManyToOne(() => StocktakingTagHeader, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'StocktakingTagHeaderRef' })
  tagHeader?: StocktakingTagHeader;

  @Column({ type: 'bigint' })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseRef' })
  warehouse?: Warehouse;

  @Column({ type: 'varchar', length: 20 })
  StocktakingDate: string;

  @Column({ type: 'bigint' })
  StocktakingNumber: number;

  @Column({ type: 'int', default: 1 })
  CountRound: number; // 1: First count, 2: Second count, 3: Third count

  @Column({ type: 'int', default: 1 })
  Status: number; // 1: Draft, 2: Confirmed

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description?: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @OneToMany(() => StocktakingCountDetail, (d) => d.count, { cascade: true })
  details?: StocktakingCountDetail[];
}
