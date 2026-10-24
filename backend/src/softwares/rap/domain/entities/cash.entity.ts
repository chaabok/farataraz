import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, Generated, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Cashier } from './cashier.entity';

@Entity({ schema: 'Rap', name: 'Cashes' })
export class Cash extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'CashID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    cashId: number;

  @Column({ name: 'Code', type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 150, nullable: true })
  title_en: string;

  @Column({ name: 'CashTypeID', type: 'int', nullable: false, default: 1 })
  cashTypeId: number;

  @Index()
  @Column({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  detailedAccountId: number;

  @ManyToOne(() => DetailedAccount, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' })
  detailedAccount: DetailedAccount;

  @Column({ name: 'CurrencyID', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  currencyId: number;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'CurrencyID', referencedColumnName: 'currencyID' })
  currency: Currency;

  @Column({ name: 'InitialBalance', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  initialBalance: number;

  @Column({ name: 'OpeningDate', type: 'date', nullable: true })
  openingDate: Date;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Cashier, cashier => cashier.cash, { cascade: ['insert', 'update'] })
  cashiers: Cashier[];
}
