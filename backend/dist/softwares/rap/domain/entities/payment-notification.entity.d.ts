import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
import { PaymentCash } from './payment-cash.entity';
import { PaymentCheque } from './payment-cheque.entity';
import { PaymentWithdrawal } from './payment-withdrawal.entity';
import { PaymentAssignment } from './payment-assignment.entity';
import { PaymentPromissoryNote } from './payment-promissory-note.entity';
import { PaymentReturnedReceivedCheque } from './payment-returned-received-cheque.entity';
import { PaymentReturnedReceivedPromissoryNote } from './payment-returned-received-promissory-note.entity';
import { PaymentGuarantee } from './payment-guarantee.entity';
export declare enum PaymentNotificationBaseType {
    NoBase = 1,
    AccountingVoucher = 2,
    PaymentOrder = 3,
    SalaryPayment = 4,
    PettyCashRequest = 5,
    PurchaseInvoice = 6,
    SalesReturn = 7,
    PartySettlement = 8
}
export declare enum PaymentNotificationType {
    ObligationsSettlement = 1,
    PettyCashCharge = 2,
    BankToBank = 3,
    BankToCash = 4,
    CashToBank = 5,
    CashToCash = 6
}
export declare class PaymentNotification extends AppBaseEntity {
    paymentNotificationId: number;
    baseType: number;
    baseNumber: string;
    paymentType: number;
    documentNumber: string;
    documentDate: Date;
    partyRef: number;
    party: Party;
    currencyRef: number;
    currency: Currency;
    voucherHeaderRef: number;
    voucherHeader: Voucher;
    exchangeRate: number;
    description: string;
    status: number;
    cashItems: PaymentCash[];
    chequeItems: PaymentCheque[];
    withdrawalItems: PaymentWithdrawal[];
    assignmentItems: PaymentAssignment[];
    promissoryNoteItems: PaymentPromissoryNote[];
    guaranteeItems: PaymentGuarantee[];
    returnedReceivedCheques: PaymentReturnedReceivedCheque[];
    returnedReceivedPromissoryNotes: PaymentReturnedReceivedPromissoryNote[];
    fiscalYearRef: number;
}
