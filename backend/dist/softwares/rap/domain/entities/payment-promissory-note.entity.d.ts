import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
import { PromissoryNoteItem } from './promissory-note-item.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
export declare class PaymentPromissoryNote extends AppBaseEntity {
    paymentPromissoryNoteId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    reasonRef: number;
    reason: RapReason;
    promissoryNoteItemRef: number;
    promissoryNoteItem: PromissoryNoteItem;
    amount: number;
    currencyRef: number;
    currency: Currency;
    equivalentAmount: number | null;
    dueDate: Date;
    description: string;
    dynamicDetailedData: any;
}
