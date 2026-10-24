import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { WarehouseType } from './warehouse-type.enum';
import { WarehouseNature } from './warehouse-nature.enum';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { WarehouseProduct } from './warehouse-product.entity';
import { WarehouseUser } from './warehouse-user.entity';
import { WarehouseAddress } from './warehouse-address.entity';
import { WarehouseKeeper } from './warehouse-keeper.entity';

@Entity({ schema: 'Inv', name: 'Warehouses' })
export class Warehouse extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseID: number;

  @Column({ type: 'int', nullable: true })
  WarehouseType: WarehouseType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  WarehouseCode: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  WarehouseTitle: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  WarehouseTitle2: string;

  @Column({ type: 'int', nullable: true })
  WarehouseNature: WarehouseNature;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Phone: string;

  @Column({ type: 'bigint', nullable: true })
  DetailedAccountRef: number;

  @ManyToOne(() => DetailedAccount, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'DetailedAccountRef' })
  DetailedAccount: DetailedAccount;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'bigint', nullable: true })
  ParentRef: number;

  @ManyToOne(() => Warehouse, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ParentRef' })
  Parent: Warehouse;

  // Address fields
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

  // Warehouse Keeper
  @Column({ type: 'bigint', nullable: true })
  WarehouseKeeperRef: number;

  @ManyToOne(() => Party, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseKeeperRef' })
  WarehouseKeeper: Party;

  @OneToMany(() => WarehouseProduct, p => p.Warehouse, { cascade: true })
  WarehouseProducts: WarehouseProduct[];

  @OneToMany(() => WarehouseUser, u => u.Warehouse, { cascade: true })
  WarehouseUsers: WarehouseUser[];

  @OneToMany(() => WarehouseAddress, a => a.Warehouse, { cascade: true })
  WarehouseAddresses: WarehouseAddress[];

  @OneToMany(() => WarehouseKeeper, k => k.Warehouse, { cascade: true })
  WarehouseKeepers: WarehouseKeeper[];
}
