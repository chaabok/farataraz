import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class ReceiptCash extends AppBaseEntity {
    receiptCashId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    cashRef: number;
    cash: Cash;
    amount: number;
    equivalentAmount: number;
    description: string;
    reasonRef: number;
    reason: RapReason;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    dynamicDetailedData: any;
}
