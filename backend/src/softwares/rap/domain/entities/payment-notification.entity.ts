import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
import { PaymentCash } from './payment-cash.entity';
import { PaymentCheque } from './payment-cheque.entity';
import { PaymentWithdrawal } from './payment-withdrawal.entity';
import { PaymentAssignment } from './payment-assignment.entity';
import { PaymentPromissoryNote } from './payment-promissory-note.entity';
import { PaymentReturnedReceivedCheque } from './payment-returned-received-cheque.entity';
import { PaymentReturnedReceivedPromissoryNote } from './payment-returned-received-promissory-note.entity';
import { PaymentGuarantee } from './payment-guarantee.entity';

export enum PaymentNotificationBaseType {
  NoBase = 1,
  AccountingVoucher = 2,
  PaymentOrder = 3,
  SalaryPayment = 4,
  PettyCashRequest = 5,
  PurchaseInvoice = 6,
  SalesReturn = 7,
  PartySettlement = 8
}

export enum PaymentNotificationType {
  ObligationsSettlement = 1,
  PettyCashCharge = 2,
  BankToBank = 3,
  BankToCash = 4,
  CashToBank = 5,
  CashToCash = 6
}

@Entity({ schema: 'Rap', name: 'PaymentNotifications' })
export class PaymentNotification extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaymentNotificationID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  paymentNotificationId: number;

  @Column({ name: 'BaseType', type: 'int', nullable: false, default: 1 })
  baseType: number;

  @Column({ name: 'BaseNumber', type: 'varchar', length: 50, nullable: true })
  baseNumber: string;

  @Column({ name: 'PaymentType', type: 'int', nullable: false, default: 1 })
  paymentType: number;

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

  @ManyToOne(() => Voucher, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' })
  voucherHeader: Voucher;

  @Column({ name: 'ExchangeRate', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : null
  }})
  exchangeRate: number;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'Status', type: 'int', default: 1 })
  status: number;

  @OneToMany(() => PaymentCash, cash => cash.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  cashItems: PaymentCash[];

  @OneToMany(() => PaymentCheque, cheque => cheque.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  chequeItems: PaymentCheque[];

  @OneToMany(() => PaymentWithdrawal, withdrawal => withdrawal.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  withdrawalItems: PaymentWithdrawal[];

  @OneToMany(() => PaymentAssignment, assignment => assignment.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  assignmentItems: PaymentAssignment[];

  @OneToMany(() => PaymentPromissoryNote, promissoryNote => promissoryNote.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  promissoryNoteItems: PaymentPromissoryNote[];
  @OneToMany(() => PaymentGuarantee, rg => rg.paymentNotification, { cascade: ["insert", "update", "remove"] })
  guaranteeItems: PaymentGuarantee[];

  @OneToMany(() => PaymentReturnedReceivedCheque, returnedCheque => returnedCheque.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  returnedReceivedCheques: PaymentReturnedReceivedCheque[];

  @OneToMany(() => PaymentReturnedReceivedPromissoryNote, returnedPromissoryNote => returnedPromissoryNote.paymentNotification, { cascade: ['insert', 'update', 'remove'] })
  returnedReceivedPromissoryNotes: PaymentReturnedReceivedPromissoryNote[];

  @Column({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1 })
  fiscalYearRef: number;
}
