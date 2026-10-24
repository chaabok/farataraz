import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { Party } from '../../../common/domain/entities/party.entity';

@Entity({ schema: 'Inv', name: 'WarehouseKeepers' })
export class WarehouseKeeper extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseKeeperID: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, w => w.WarehouseKeepers, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'WarehouseRef' })
  Warehouse: Warehouse;

  @Column({ type: 'bigint', nullable: true })
  WarehouseKeeperRef: number;

  @ManyToOne(() => Party, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseKeeperRef' })
  WarehouseKeeper: Party;

  @Column({ type: 'varchar', length: 250, nullable: true })
  Address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  MobilePhone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Phone: string;
}
