export declare function toEnglishDigits(str: string): string;
export declare function parseDateString({ value }: {
    value: any;
}): any;
export declare class ReceiptCashDto {
    receiptCashId?: number;
    receiptNotificationRef?: number;
    cashRef: number;
    amount: number;
    accountingSettingRef?: number;
    equivalentAmount?: number;
    description?: string;
    dynamicDetailedData?: any;
    reasonRef?: number;
}
export declare class ReceiptChequeDto {
    receiptChequeId?: number;
    receiptNotificationRef?: number;
    accountingSettingRef?: number;
    bankRef?: number;
    cashRef?: number;
    branchName?: string;
    accountNumber: string;
    amount: number;
    chequeNumber?: string;
    dueDate?: string | Date;
    sayyadNumber?: string;
    endorsementNumber?: string;
    currency?: string;
    description?: string;
    dynamicDetailedData?: any;
    reasonRef?: number;
}
export declare class ReceiptDepositDto {
    receiptDepositId?: number;
    receiptNotificationRef?: number;
    bankAccountRef: number;
    amount: number;
    trackingNumber?: string;
    equivalentAmount?: number;
    description?: string;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class ReceiptReturnedPaidChequeDto {
    receiptReturnedPaidChequeId?: number;
    paymentChequeRef?: number;
    cashRef?: number;
    amount: number;
    description?: string;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class ReceiptPromissoryNoteDto {
    receiptPromissoryNoteId?: number;
    receiptNotificationRef?: number;
    accountingSettingRef?: number;
    cashRef?: number;
    reasonRef?: number;
    amount: number;
    promissoryNoteNumber: string;
    promissoryNoteValue?: number;
    description?: string;
    dynamicDetailedData?: any;
}
export declare class ReceiptReturnedPaymentAssignmentDto {
    receiptReturnedPaymentAssignmentId?: number;
    paymentAssignmentRef?: number;
    amount: number;
    cashRef?: number;
    description?: string;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class ReceiptReturnedPaymentPromissoryNoteDto {
    receiptReturnedPaymentPromissoryNoteId?: number;
    paymentPromissoryNoteRef?: number;
    amount: number;
    description?: string;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class CreateReceiptNotificationDto {
    baseType: string;
    baseNumber?: string;
    receiptType: string;
    documentNumber?: string;
    documentDate: Date;
    partyRef?: number;
    voucherHeaderRef?: number;
    currencyRef?: number;
    exchangeRate?: number;
    reasonRef?: number;
    description?: string;
    dynamicDetailedData?: any;
    status?: number;
    fiscalYearRef?: number;
    cashItems?: ReceiptCashDto[];
    chequeItems?: ReceiptChequeDto[];
    depositItems?: ReceiptDepositDto[];
    returnedPaymentChequesItems?: ReceiptReturnedPaidChequeDto[];
    returnedPaymentAssignments?: ReceiptReturnedPaymentAssignmentDto[];
    returnedPaymentPromissoryNotes?: ReceiptReturnedPaymentPromissoryNoteDto[];
    promissoryNoteItems?: ReceiptPromissoryNoteDto[];
    guaranteeItems?: ReceiptGuaranteeDto[];
}
export declare class ReceiptGuaranteeDto {
    receiptGuaranteeId?: number;
    receiptNotificationRef?: number;
    accountingSettingRef?: number;
    cashRef?: number;
    reasonRef?: number;
    amount: number;
    guaranteeNumber: string;
    guaranteeType?: number;
    baseDocument?: string;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
}
