import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { PaymentCheque } from './payment-cheque.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class ReceiptReturnedPaidCheque extends AppBaseEntity {
    receiptReturnedPaidChequeId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    paymentChequeRef: number;
    paymentCheque: PaymentCheque;
    cashRef: number;
    cash: Cash;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    description: string;
    dynamicDetailedData: any;
}
