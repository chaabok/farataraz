import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from './account.entity';

@Entity({ schema: 'Acc', name: 'AccountsVoucherDecriptions' })
export class AccountsVoucherDecriptions extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'AccountsVoucherDecriptionID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ name: 'AccountID', type: 'bigint' })
  accountId: number;

  @ManyToOne(() => Account, account => account.frequentDescriptions, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'AccountID' })
  account: Account;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'Description_En', type: 'varchar', length: 500, nullable: true })
  description2: string;
}
