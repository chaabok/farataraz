import { Entity, PrimaryColumn, Generated, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Voucher } from './voucher.entity';

@Entity({ schema: 'Acc', name: 'VoucherItem' })
export class VoucherItem extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'VoucherItemID', 
    type: 'bigint',
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
    voucherItemId: number;

  @Column({ name: 'VoucherID', type: 'bigint' })
  voucherId: number;

  @ManyToOne(() => Voucher, voucher => voucher.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'VoucherID' })
  voucher: Voucher;

  @Column({ name: 'RowNumber', type: 'integer' })
  rowNumber: number;

  @Column({ name: 'AccountID', type: 'bigint' })
  accountId: number;

  @Column({ name: 'DetailedAccountID1', type: 'bigint', nullable: true })
  detailedAccountId1: number | null;

  @Column({ name: 'DetailedAccountID2', type: 'bigint', nullable: true })
  detailedAccountId2: number | null;

  @Column({ name: 'DetailedAccountID3', type: 'bigint', nullable: true })
  detailedAccountId3: number | null;

  @Column({ name: 'DetailedAccountID4', type: 'bigint', nullable: true })
  detailedAccountId4: number | null;

  @Column({ name: 'DetailedAccountID5', type: 'bigint', nullable: true })
  detailedAccountId5: number | null;

  @Column({ name: 'DetailedAccountID6', type: 'bigint', nullable: true })
  detailedAccountId6: number | null;

  @Column({ name: 'DetailedAccountID7', type: 'bigint', nullable: true })
  detailedAccountId7: number | null;

  @Column({ name: 'DetailedAccountID8', type: 'bigint', nullable: true })
  detailedAccountId8: number | null;

  @Column({ name: 'DetailedAccountID9', type: 'bigint', nullable: true })
  detailedAccountId9: number | null;

  @Column({ name: 'DetailedAccountID10', type: 'bigint', nullable: true })
  detailedAccountId10: number | null;

  @Column({ name: 'Debit', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: {
      to: (value: number) => value,
      from: (value: any) => parseFloat(value)
  }})
  debit: number;

  @Column({ name: 'Credit', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: {
      to: (value: number) => value,
      from: (value: any) => parseFloat(value)
  }})
  credit: number;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'CurrencyID', type: 'bigint', nullable: true, transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  } })
  currencyId: number | null;

  @Column({ name: 'CurrencyAmount', type: 'decimal', precision: 18, scale: 4, nullable: true, transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseFloat(value) : null
  }})
  currencyAmount: number | null;

  @Column({ name: 'ExchangeRate', type: 'decimal', precision: 18, scale: 6, nullable: true, transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseFloat(value) : null
  }})
  exchangeRate: number | null;

  @Column({ name: 'TrackingNumber', type: 'varchar', length: 50, nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'TrackingDate', type: 'date', nullable: true })
  trackingDate: Date | null;

  @Column({ name: 'IsSystemGenerated', type: 'boolean', default: false })
  isSystemGenerated: boolean;

  account?: any;
  detailedAccount1?: any;
  detailedAccount2?: any;
  detailedAccount3?: any;
  detailedAccount4?: any;
  detailedAccount5?: any;
  detailedAccount6?: any;
  detailedAccount7?: any;
  detailedAccount8?: any;
  detailedAccount9?: any;
  detailedAccount10?: any;
}
