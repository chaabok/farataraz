import { GuaranteeType } from './guarantee-type.enum';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
import { Cash } from './cash.entity';
import { Bank } from './bank.entity';
export declare class ReceiptGuarantee extends AppBaseEntity {
    receiptGuaranteeId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    cashRef: number;
    cash: Cash;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    guaranteeNumber: string;
    guaranteeType: GuaranteeType | null;
    baseDocument: string | null;
    description: string;
    bankRef: number | null;
    bank: Bank;
    accountNumber: string | null;
    notificationDate: Date | null;
    dynamicDetailedData: any;
}
