import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { ReceiptPromissoryNote } from './receipt-promissory-note.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class PaymentReturnedReceivedPromissoryNote extends AppBaseEntity {
    paymentReturnedReceivedPromissoryNoteId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
    receiptPromissoryNoteRef: number;
    receiptPromissoryNote: ReceiptPromissoryNote;
    amount: number;
    reasonRef: number;
    reason: RapReason;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    description: string;
    dynamicDetailedData: any;
}
