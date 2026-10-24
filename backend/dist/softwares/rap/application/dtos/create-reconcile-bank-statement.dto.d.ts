export declare class CreateReconcileBankStatementItemDto {
    documentNumber?: string;
    documentDate?: string;
    debit?: number;
    credit?: number;
    description?: string;
}
export declare class CreateReconcileBankStatementDto {
    BankAccountRef?: number;
    Number?: string;
    Date?: string;
    fromDate?: string;
    previousBalance?: number;
    balance?: number;
    fiscalYearRef?: number;
    items?: CreateReconcileBankStatementItemDto[];
}
