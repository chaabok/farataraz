import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReceiptNotification } from './receipt-notification.entity';
import { PaymentAssignment } from './payment-assignment.entity';
import { Cash } from './cash.entity';
import { RapReason } from './rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from './reciept-and-payment-accounting-setting.entity';
export declare class ReceiptReturnedPaymentAssignment extends AppBaseEntity {
    receiptReturnedPaymentAssignmentId: number;
    receiptNotificationRef: number;
    receiptNotification: ReceiptNotification;
    paymentAssignmentRef: number;
    paymentAssignment: PaymentAssignment;
    accountingSettingRef: number;
    accountingSetting: RecieptAndPaymentAccountingSetting;
    cashRef: number;
    cash: Cash;
    reasonRef: number;
    reason: RapReason;
    amount: number;
    description: string;
    dynamicDetailedData: any;
}
