import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { PaymentPromissoryNote } from './payment-promissory-note.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class ReceiptReturnedPaymentPromissoryNote extends AppBaseEntity {
    receiptReturnedPaymentPromissoryNoteId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    paymentPromissoryNoteRef: number;
    paymentPromissoryNote: PaymentPromissoryNote;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    description: string;
    dynamicDetailedData: any;
}
