import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Currency } from './currency.entity';

@Entity({ schema: 'Gnr', name: 'CurrencyExchangeRate' })
export class CurrencyExchangeRate extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'CurrencyExchangeRateID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  currencyExchangeRateId: number;

  @Column({ 
    type: 'bigint', 
    name: 'BaseCurrencyRef',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  baseCurrencyRef: number;

  @ManyToOne(() => Currency, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'BaseCurrencyRef', referencedColumnName: 'currencyID' })
  baseCurrencyEntity?: Currency;

  @Column({ 
    type: 'bigint', 
    name: 'TargetCurrencyRef',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  targetCurrencyRef: number;

  @ManyToOne(() => Currency, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'TargetCurrencyRef', referencedColumnName: 'currencyID' })
  targetCurrencyEntity?: Currency;

  @Column({ type: 'date', name: 'EffectiveDate' })
  effectiveDate: string;

  @Column({ type: 'numeric', precision: 18, scale: 6, name: 'ExchangeRate' })
  exchangeRate: number;
}
