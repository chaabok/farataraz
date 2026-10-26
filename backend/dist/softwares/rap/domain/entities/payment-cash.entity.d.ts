import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class PaymentCash extends AppBaseEntity {
    paymentCashId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
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
