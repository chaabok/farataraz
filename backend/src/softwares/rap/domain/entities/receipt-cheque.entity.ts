import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { Bank } from './bank.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';

@Entity({ schema: 'Rap', name: 'ReceiptCheque' })
export class ReceiptCheque extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ReceiptChequeID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  receiptChequeId: number;

  @Column({ name: 'ReceiptNotificationRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  receiptNotificationRef: number;

  @ManyToOne(() => ReceiptNotification, pn => pn.chequeItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ReceiptNotificationRef', referencedColumnName: 'receiptNotificationId' })
  receiptNotification: ReceiptNotification;

  @Column({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  accountingSettingRef: number;

  @ManyToOne(() => RecieptAndPaymentAccountingSetting, { eager: true, nullable: true })
  @JoinColumn({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' })
  accountingSetting: RecieptAndPaymentAccountingSetting;

  @Column({ name: 'CashRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  cashRef: number;

  @ManyToOne(() => Cash, { eager: true, nullable: true })
  @JoinColumn({ name: 'CashRef', referencedColumnName: 'cashId' })
  cash: Cash;

  @Column({ name: 'BankRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  bankRef: number;

  @ManyToOne(() => Bank, { eager: true, nullable: true })
  @JoinColumn({ name: 'BankRef', referencedColumnName: 'bankId' })
  bank: Bank;

  @Column({ name: 'BranchName', type: 'varchar', length: 150, nullable: true })
  branchName: string;

  @Column({ name: 'AccountNumber', type: 'varchar', length: 100, nullable: false })
  accountNumber: string;

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
