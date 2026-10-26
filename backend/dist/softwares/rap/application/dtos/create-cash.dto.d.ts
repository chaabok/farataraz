export declare class CreateCashDto {
    code: string;
    title: string;
    title_en?: string;
    cashTypeId?: number;
    detailedAccountCode: string;
    currencyId: number;
    initialBalance?: number;
    openingDate?: Date;
    isActive?: boolean;
    description?: string;
    cashiers?: number[];
}
