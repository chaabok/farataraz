export declare class CreateBankReconciliationItemDto {
    BankStatementItemRef?: number;
    BookItemRef?: string;
    matchId?: string;
}
export declare class CreateBankReconciliationDto {
    BankAccountRef?: number;
    ReconcileBankStatementRef?: number;
    Number?: string;
    Date?: string;
    isOpening?: boolean;
    items?: CreateBankReconciliationItemDto[];
}
