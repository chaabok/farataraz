import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from './account.entity';

@Entity({ schema: 'Acc', name: 'AccountsNatureAdjusting' })
export class AccountsNatureAdjusting extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'AccountsNatureAdjustingID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ name: 'AccountID', type: 'bigint' })
  accountId: number;

  @ManyToOne(() => Account, account => account.natureAdjustments, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'AccountID' })
  account: Account;

  @Column({ name: 'MoinCode', type: 'varchar', length: 50, nullable: true })
  moinCode: string;

  @Column({ name: 'MoinTitle', type: 'varchar', length: 200, nullable: true })
  moinTitle: string;

  @Column({ name: 'Nature', type: 'varchar', length: 100, nullable: true })
  nature: string;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'Description2', type: 'varchar', length: 500, nullable: true })
  description2: string;
}
