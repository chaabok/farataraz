import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { BankAccount } from './bank-account.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class PaymentWithdrawal extends AppBaseEntity {
    paymentWithdrawalId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
    bankAccountRef: number;
    bankAccount: BankAccount;
    amount: number;
    trackingNumber: string;
    equivalentAmount: number;
    description: string;
    reasonRef: number;
    reason: RapReason;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    dynamicDetailedData: any;
}
