import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Sle', name: 'Wallets' })
export class Wallet extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  WalletID: number;

  @Column({ type: 'int', nullable: false })
  Code: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title2: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  Nature: number; // 1: افزاینده, 2: کاهنده

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
