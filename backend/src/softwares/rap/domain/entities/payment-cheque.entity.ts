import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { BankAccount } from './bank-account.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
import { Chequebook } from './chequebook.entity';

@Entity({ schema: 'Rap', name: 'PaymentCheque' })
export class PaymentCheque extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaymentChequeID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  paymentChequeId: number;

  @Column({ name: 'PaymentNotificationRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  paymentNotificationRef: number;

  @ManyToOne(() => PaymentNotification, pn => pn.chequeItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PaymentNotificationRef', referencedColumnName: 'paymentNotificationId' })
  paymentNotification: PaymentNotification;

  @Column({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  accountingSettingRef: number;

  @ManyToOne(() => RecieptAndPaymentAccountingSetting, { eager: true, nullable: true })
  @JoinColumn({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' })
  accountingSetting: RecieptAndPaymentAccountingSetting;

  @Column({ name: 'BankAccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  bankAccountRef: number;

  @ManyToOne(() => BankAccount, { eager: true, nullable: true })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ name: 'ChequebookRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  chequebookRef: number;

  @ManyToOne(() => Chequebook, { eager: true, nullable: true })
  @JoinColumn({ name: 'ChequebookRef', referencedColumnName: 'chequebookId' })
  chequebook: Chequebook;

  @Column({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  reasonRef: number;

  @ManyToOne(() => RapReason, { eager: true, nullable: true })
  @JoinColumn({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' })
  reason: RapReason;

  @Column({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : 0
  }})
  amount: number;

  @Column({ name: 'ChequeNumber', type: 'varchar', length: 50, nullable: true })
  chequeNumber: string;

  @Column({ name: 'Currency', type: 'varchar', length: 50, nullable: true })
  currency: string;

  @Column({ name: 'DueDate', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'SayyadNumber', type: 'varchar', length: 50, nullable: true })
  sayyadNumber: string;

  @Column({ name: 'EndorsementNumber', type: 'varchar', length: 50, nullable: true })
  endorsementNumber: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true })
  dynamicDetailedData: any;
}
