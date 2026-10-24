import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';

@Entity({ schema: 'Inv', name: 'ItemVolumeCbms' })
export class ItemVolumeCbm extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  ItemVolumeCbmID: number;

  @Column({ type: 'bigint' })
  ItemRef: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ItemRef' })
  Item: Item;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  Quantity: number;

  @Column({ type: 'bigint', nullable: true })
  MeasurementUnitRef: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Length: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Width: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Height: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  Volume: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
