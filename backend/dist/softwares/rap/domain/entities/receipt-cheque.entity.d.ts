import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { Bank } from './bank.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class ReceiptCheque extends AppBaseEntity {
    receiptChequeId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    cashRef: number;
    cash: Cash;
    bankRef: number;
    bank: Bank;
    branchName: string;
    accountNumber: string;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    chequeNumber: string;
    currency: string;
    dueDate: Date;
    sayyadNumber: string;
    endorsementNumber: string;
    description: string;
    dynamicDetailedData: any;
}
