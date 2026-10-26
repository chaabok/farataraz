import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { ReceiptCheque } from './receipt-cheque.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class PaymentAssignment extends AppBaseEntity {
    paymentAssignmentId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    receiptChequeRef: number;
    receiptCheque: ReceiptCheque;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    description: string;
    dynamicDetailedData: any;
}
