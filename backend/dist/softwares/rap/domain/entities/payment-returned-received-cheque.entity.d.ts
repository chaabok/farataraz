import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { ReceiptCheque } from './receipt-cheque.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class PaymentReturnedReceivedCheque extends AppBaseEntity {
    paymentReturnedReceivedChequeId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
    receiptChequeRef: number;
    receiptCheque: ReceiptCheque;
    cashRef: number;
    cash: Cash;
    amount: number;
    reasonRef: number;
    reason: RapReason;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    description: string;
    dynamicDetailedData: any;
}
