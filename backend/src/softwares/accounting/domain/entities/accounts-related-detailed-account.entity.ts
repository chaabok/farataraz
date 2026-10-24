import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from './account.entity';
import { DetailedType } from './detailed-type.entity';

@Entity({ schema: 'Acc', name: 'AccountsRelatedDeatailedAccounts' })
export class AccountsRelatedDetailedAccount extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint', 
    name: 'AccountsRelatedDeatailedAccountsID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ name: 'AccountID', type: 'bigint' })
  accountId: number;

  @ManyToOne(() => Account, account => account.relatedDetailedAccounts, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'AccountID' })
  account: Account;

  @Column({ name: 'DetailedLevel', type: 'int' })
  detailedLevel: number;

  @Column({ name: 'DetailedTypesID', type: 'bigint' })
  detailedTypeId: number;

  @ManyToOne(() => DetailedType, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedTypesID' })
  detailedType: DetailedType;
}
