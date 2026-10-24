import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Party } from '../../../common/domain/entities/party.entity';

@Entity({ schema: 'Rap', name: 'PettyCashes' })
export class PettyCash extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PettyCashID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    pettyCashId: number;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'CurrencyID', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  currencyId: number;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'CurrencyID', referencedColumnName: 'currencyID' })
  currency: Currency;

  @Column({ name: 'OpeningDate', type: 'date', nullable: true })
  openingDate: Date;

  @Column({ name: 'InitialBalance', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  initialBalance: number;

  @Column({ name: 'PettyCashLimit', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  pettyCashLimit: number;

  @Column({ name: 'CurrentBalance', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  currentBalance: number;

  @Index()
  @Column({ name: 'AccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  accountRef: number;

  @ManyToOne(() => Account, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'AccountRef', referencedColumnName: 'id' })
  account: Account;

  @Index()
  @Column({ name: 'PartyRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  partyRef: number;

  @ManyToOne(() => Party, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'PartyRef', referencedColumnName: 'partyId' })
  party: Party;

  @Column({ name: 'IsPettyCashLimitControlled', type: 'boolean', default: false })
  isPettyCashLimitControlled: boolean;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;
}
