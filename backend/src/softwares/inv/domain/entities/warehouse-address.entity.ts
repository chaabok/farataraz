import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';

@Entity({ schema: 'Inv', name: 'WarehouseAddresses' })
export class WarehouseAddress extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseAddressID: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, w => w.WarehouseAddresses, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'WarehouseRef' })
  Warehouse: Warehouse;

  @Column({ type: 'varchar', length: 100, nullable: true })
  AddressState: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  AddressCity: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  AddressTitle: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  AddressTitle2: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  PostalCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Longitude: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Latitude: string;
}
