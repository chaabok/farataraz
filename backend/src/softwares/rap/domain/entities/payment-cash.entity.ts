import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';

@Entity({ schema: 'Rap', name: 'PaymentCash' })
export class PaymentCash extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaymentCashID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  paymentCashId: number;

  @Column({ name: 'PaymentNotificationRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  paymentNotificationRef: number;

  @ManyToOne(() => PaymentNotification, pn => pn.cashItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PaymentNotificationRef', referencedColumnName: 'paymentNotificationId' })
  paymentNotification: PaymentNotification;

  @Column({ name: 'CashRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  cashRef: number;

  @ManyToOne(() => Cash, { eager: true })
  @JoinColumn({ name: 'CashRef', referencedColumnName: 'cashId' })
  cash: Cash;

  @Column({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  amount: number;

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
