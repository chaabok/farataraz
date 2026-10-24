import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaymentNotification } from './payment-notification.entity';
import { BankAccount } from './bank-account.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
import { Chequebook } from './chequebook.entity';
export declare class PaymentCheque extends AppBaseEntity {
    paymentChequeId: number;
    paymentNotificationRef: number;
    paymentNotification: PaymentNotification;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    bankAccountRef: number;
    bankAccount: BankAccount;
    chequebookRef: number;
    chequebook: Chequebook;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    chequeNumber: string;
    currency: string;
    dueDate: Date;
    sayyadNumber: string;
    endorsementNumber: string;
    description: string;
    dynamicDetailedData: any;
}
