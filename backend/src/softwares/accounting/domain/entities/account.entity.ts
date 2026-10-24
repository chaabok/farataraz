import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany , Generated, Check} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { AccountsRelatedDetailedAccount } from './accounts-related-detailed-account.entity';
import { AccountsNatureAdjusting } from './accounts-nature-adjusting.entity';
import { AccountsVoucherDecriptions } from './accounts-voucher-decriptions.entity';

@Entity({ schema: 'Acc', name: 'Accounts' })
@Check('"AccountID" != "ParentID"')
@Check('length("Code") > 0')
export class Account extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'AccountID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ name: 'Code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 100, nullable: true })
  title_en: string;

  @Column({ name: 'ParentID', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  parentId: number;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ParentID' })
  parent: Account;

  @Column({ name: 'AccountType', type: 'int', nullable: true })
  accountType: number;

  @Column({ name: 'AccountNature', type: 'int', nullable: false, default: 7 })
  accountNature: number;

  @Column({ name: 'NatureControl', type: 'int', nullable: true })
  natureControl: number;

  @Column({ name: 'IsActive', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'TrackingFeature', type: 'boolean', nullable: true, default: false })
  trackingFeature: boolean;

  @Column({ name: 'CurrencyFeature', type: 'boolean', nullable: true, default: false })
  currencyFeature: boolean;

  @Column({ name: 'ExchangeableFeature', type: 'boolean', nullable: true, default: false })
  exchangeableFeature: boolean;

  @Column({ name: 'TrackingQuantity', type: 'boolean', nullable: true, default: false })
  trackingQuantity: boolean;

  @Column({ name: 'TrackingNumber', type: 'boolean', nullable: true, default: false })
  trackingNumber: boolean;

  @Column({ name: 'TrackingDate', type: 'boolean', nullable: true, default: false })
  trackingDate: boolean;

  @OneToMany(() => AccountsRelatedDetailedAccount, related => related.account, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  relatedDetailedAccounts: AccountsRelatedDetailedAccount[];

  @OneToMany(() => AccountsNatureAdjusting, adjusting => adjusting.account, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  natureAdjustments: AccountsNatureAdjusting[];

  @OneToMany(() => AccountsVoucherDecriptions, desc => desc.account, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  frequentDescriptions: AccountsVoucherDecriptions[];
}
