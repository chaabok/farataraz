import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
import { RapReason } from './rap-reason.entity';
import { ReceiptCash } from './receipt-cash.entity';
import { ReceiptCheque } from './receipt-cheque.entity';
import { ReceiptDeposit } from './receipt-deposit.entity';
import { ReceiptReturnedPaidCheque } from './receipt-returned-paid-cheque.entity';
import { ReceiptPromissoryNote } from './receipt-promissory-note.entity';
import { ReceiptReturnedPaymentAssignment } from './receipt-returned-payment-assignment.entity';
import { ReceiptReturnedPaymentPromissoryNote } from './receipt-returned-payment-promissory-note.entity';
import { ReceiptGuarantee } from './receipt-guarantee.entity';

@Entity({ schema: 'Rap', name: 'ReceiptNotifications' })
export class ReceiptNotification extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ReceiptNotificationID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  receiptNotificationId: number;

  @Column({ name: 'BaseType', type: 'varchar', length: 100, nullable: false, default: 'بدون مبنا' })
  baseType: string;

  @Column({ name: 'BaseNumber', type: 'varchar', length: 50, nullable: true })
  baseNumber: string;

  @Column({ name: 'ReceiptType', type: 'varchar', length: 100, nullable: false, default: 'تسویه تعهدات' })
  receiptType: string;

  @Column({ name: 'DocumentNumber', type: 'varchar', length: 50, nullable: false })
  documentNumber: string;

  @Column({ name: 'DocumentDate', type: 'date', nullable: false })
  documentDate: Date;

  @Column({ name: 'PartyRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  partyRef: number;

  @ManyToOne(() => Party, { eager: true, nullable: true })
  @JoinColumn({ name: 'PartyRef', referencedColumnName: 'partyId' })
  party: Party;

  @Column({ name: 'CurrencyRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  currencyRef: number;

  @ManyToOne(() => Currency, { eager: true, nullable: true })
  @JoinColumn({ name: 'CurrencyRef', referencedColumnName: 'currencyID' })
  currency: Currency;

  @Column({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  voucherHeaderRef: number;

  @ManyToOne(() => Voucher, { eager: false, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' })
  voucherHeader: Voucher;

  @Column({ name: 'ExchangeRate', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : null
  }})
  exchangeRate: number;

  @Column({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  reasonRef: number;

  @ManyToOne(() => RapReason, { eager: true, nullable: true })
  @JoinColumn({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' })
  reason: RapReason;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'Status', type: 'int', default: 1 })
  status: number;

  @OneToMany(() => ReceiptCash, cash => cash.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  cashItems: ReceiptCash[];

  @OneToMany(() => ReceiptCheque, cheque => cheque.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  chequeItems: ReceiptCheque[];

  @OneToMany(() => ReceiptDeposit, withdrawal => withdrawal.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  depositItems: ReceiptDeposit[];

  @OneToMany(() => ReceiptReturnedPaidCheque, returnedCheque => returnedCheque.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  returnedPaidCheques: ReceiptReturnedPaidCheque[];

  @OneToMany(() => ReceiptPromissoryNote, rp => rp.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  promissoryNoteItems: ReceiptPromissoryNote[];
  @OneToMany(() => ReceiptGuarantee, rg => rg.receiptNotification, { cascade: ["insert", "update", "remove"] })
  guaranteeItems: ReceiptGuarantee[];

  @OneToMany(() => ReceiptReturnedPaymentAssignment, rrpa => rrpa.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  returnedPaymentAssignments: ReceiptReturnedPaymentAssignment[];

  @OneToMany(() => ReceiptReturnedPaymentPromissoryNote, rrppn => rrppn.receiptNotification, { cascade: ['insert', 'update', 'remove'] })
  returnedPaymentPromissoryNotes: ReceiptReturnedPaymentPromissoryNote[];

  @Column({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1 })
  fiscalYearRef: number;
}
