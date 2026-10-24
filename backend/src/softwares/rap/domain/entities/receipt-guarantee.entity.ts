import { GuaranteeType } from './guarantee-type.enum';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
import { Cash } from './cash.entity';
import { Bank } from './bank.entity';

@Entity({ schema: 'Rap', name: 'ReceiptGuarantee' })
export class ReceiptGuarantee extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ReceiptGuaranteeID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  receiptGuaranteeId: number;

  @Column({ name: 'ReceiptNotificationRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  receiptNotificationRef: number;

  @ManyToOne(() => ReceiptNotification, pn => pn.guaranteeItems, { onDelete: 'CASCADE' })
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

  @Column({ name: 'GuaranteeNumber', type: 'varchar', length: 150, nullable: false })
  guaranteeNumber: string;

  @Column({ name: 'GuaranteeType', type: 'smallint', nullable: true })
  guaranteeType: GuaranteeType | null;
  
  @Column({ name: 'BaseDocument', type: 'varchar', length: 150, nullable: true })
  baseDocument: string | null;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;


  @Column({ name: 'BankRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  bankRef: number | null;

  @ManyToOne(() => Bank, { eager: true, nullable: true })
  @JoinColumn({ name: 'BankRef', referencedColumnName: 'bankId' })
  bank: Bank;

  @Column({ name: 'AccountNumber', type: 'varchar', length: 150, nullable: true })
  accountNumber: string | null;

  @Column({ name: 'NotificationDate', type: 'date', nullable: true })
  notificationDate: Date | null;

  @Column({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true })
  dynamicDetailedData: any;
}
