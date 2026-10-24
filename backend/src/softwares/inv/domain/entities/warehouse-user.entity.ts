import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { User } from '../../../../core/iam/entities/user.entity';

@Entity({ schema: 'Inv', name: 'WarehouseUsers' })
export class WarehouseUser extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WarehouseUserID: number;

  @Column({ type: 'bigint', nullable: true })
  WarehouseRef: number;

  @ManyToOne(() => Warehouse, w => w.WarehouseUsers, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'WarehouseRef' })
  Warehouse: Warehouse;

  @Column({ type: 'bigint', nullable: true })
  UserRef: number;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'UserRef' })
  User: User;
}
