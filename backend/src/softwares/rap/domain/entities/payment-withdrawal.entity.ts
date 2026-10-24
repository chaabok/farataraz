import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { BankAccount } from './bank-account.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';

@Entity({ schema: 'Rap', name: 'PaymentWithdrawal' })
export class PaymentWithdrawal extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaymentWithdrawalID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  paymentWithdrawalId: number;

  @Column({ name: 'PaymentNotificationRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  paymentNotificationRef: number;

  @ManyToOne(() => PaymentNotification, pn => pn.withdrawalItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PaymentNotificationRef', referencedColumnName: 'paymentNotificationId' })
  paymentNotification: PaymentNotification;

  @Column({ name: 'BankAccountRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankAccountRef: number;

  @ManyToOne(() => BankAccount, { eager: true })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  amount: number;

  @Column({ name: 'TrackingNumber', type: 'varchar', length: 100, nullable: true })
  trackingNumber: string;

  @Column({ name: 'EquivalentAmount', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : null
  }})
  equivalentAmount: number;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  reasonRef: number;

  @ManyToOne(() => RapReason, { eager: true, nullable: true })
  @JoinColumn({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' })
  reason: RapReason;

  @Column({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  accountingSettingRef: number;

  @ManyToOne(() => RecieptAndPaymentAccountingSetting, { eager: true, nullable: true })
  @JoinColumn({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' })
  accountingSetting: RecieptAndPaymentAccountingSetting;

  @Column({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true })
  dynamicDetailedData: any;
}
