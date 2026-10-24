import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { BankAccount } from './bank-account.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class ReceiptDeposit extends AppBaseEntity {
    receiptDepositId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    bankAccountRef: number;
    bankAccount: BankAccount;
    amount: number;
    trackingNumber: string;
    equivalentAmount: number;
    description: string;
    reasonRef: number;
    reason: RapReason;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    dynamicDetailedData: any;
}
