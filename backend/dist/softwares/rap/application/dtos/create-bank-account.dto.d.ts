export declare class CreateBankAccountDto {
    bankAccountId?: number;
    bankBranchRef: number;
    bankAccountTypeRef: number;
    accountNumber: string;
    title?: string;
    latinTitle?: string;
    shabaNumber?: string;
    detailedCode?: number;
    accountRef?: number;
    currencyRef?: number;
    initialBalance?: number;
    openingDate?: string | Date;
    accountHolderName?: string;
    isActive?: boolean;
}
