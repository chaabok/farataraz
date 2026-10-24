import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
import { Cash } from './cash.entity';
export declare class ReceiptPromissoryNote extends AppBaseEntity {
    receiptPromissoryNoteId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    cashRef: number;
    cash: Cash;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    promissoryNoteNumber: string;
    promissoryNoteValue: number | null;
    description: string;
    dynamicDetailedData: any;
}
