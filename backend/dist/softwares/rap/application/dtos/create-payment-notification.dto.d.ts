export declare function toEnglishDigits(str: string): string;
export declare function parseDateString({ value }: {
    value: any;
}): any;
export declare class PaymentCashDto {
    paymentCashId?: number;
    paymentNotificationRef?: number;
    cashRef: number;
    amount: number;
    accountingSettingRef?: number;
    equivalentAmount?: number;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    reasonRef?: number;
}
export declare class PaymentChequeDto {
    paymentChequeId?: number;
    paymentNotificationRef?: number;
    accountingSettingRef?: number;
    bankAccountRef?: number;
    chequebookRef?: number;
    amount: number;
    chequeNumber?: string;
    dueDate?: string | Date;
    sayyadNumber?: string;
    endorsementNumber?: string;
    currency?: string;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    reasonRef?: number;
}
export declare class PaymentWithdrawalDto {
    paymentWithdrawalId?: number;
    paymentNotificationRef?: number;
    bankAccountRef: number;
    amount: number;
    trackingNumber?: string;
    equivalentAmount?: number;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class PaymentAssignmentDto {
    paymentAssignmentId?: number;
    paymentNotificationRef?: number;
    receiptChequeRef?: number;
    amount: number;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class PaymentPromissoryNoteDto {
    paymentPromissoryNoteId?: number;
    paymentNotificationRef?: number;
    accountingSettingRef?: number;
    reasonRef?: number;
    promissoryNoteItemRef?: number;
    amount: number;
    currencyRef?: number;
    equivalentAmount?: number;
    dueDate?: string | Date;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
}
export declare class PaymentReturnedReceivedChequeDto {
    paymentReturnedReceivedChequeId?: number;
    paymentNotificationRef?: number;
    receiptChequeRef?: number;
    cashRef?: number;
    amount: number;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class PaymentReturnedReceivedPromissoryNoteDto {
    paymentReturnedReceivedPromissoryNoteId?: number;
    paymentNotificationRef?: number;
    receiptPromissoryNoteRef?: number;
    amount: number;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    reasonRef?: number;
    accountingSettingRef?: number;
}
export declare class CreatePaymentNotificationDto {
    baseType: number;
    baseNumber?: string;
    paymentType: number;
    documentNumber?: string;
    documentDate: Date;
    partyRef?: number;
    currencyRef?: number;
    voucherHeaderRef?: number;
    exchangeRate?: number;
    description?: string;
    bankRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
    status?: number;
    fiscalYearRef?: number;
    cashItems?: PaymentCashDto[];
    chequeItems?: PaymentChequeDto[];
    withdrawalItems?: PaymentWithdrawalDto[];
    assignmentItems?: PaymentAssignmentDto[];
    promissoryNoteItems?: PaymentPromissoryNoteDto[];
    guaranteeItems?: PaymentGuaranteeDto[];
    returnedReceivedCheques?: PaymentReturnedReceivedChequeDto[];
    returnedReceivedPromissoryNotes?: PaymentReturnedReceivedPromissoryNoteDto[];
}
export declare class PaymentGuaranteeDto {
    paymentGuaranteeId?: number;
    paymentNotificationRef?: number;
    accountingSettingRef?: number;
    cashRef?: number;
    reasonRef?: number;
    amount: number;
    currencyRef?: number;
    equivalentAmount?: number;
    dueDate?: Date;
    guaranteeNumber: string;
    guaranteeType?: number;
    baseDocument?: string;
    description?: string;
    bankRef?: number;
    bankAccountRef?: number;
    accountNumber?: string;
    notificationDate?: Date;
    dynamicDetailedData?: any;
}
