import { toEnglishDigits, parseDateString } from '../../../../core/utils/date-parser';
export { toEnglishDigits, parseDateString };
export declare class CreateVoucherItemDto {
    voucherItemId?: number;
    rowNumber: number;
    accountId: number;
    detailedAccountId1?: number;
    detailedAccountId2?: number;
    detailedAccountId3?: number;
    detailedAccountId4?: number;
    detailedAccountId5?: number;
    detailedAccountId6?: number;
    detailedAccountId7?: number;
    detailedAccountId8?: number;
    detailedAccountId9?: number;
    detailedAccountId10?: number;
    debit: number;
    credit: number;
    description?: string;
    isDeleted?: boolean;
    currencyId?: number;
    currencyAmount?: number;
    exchangeRate?: number;
    trackingNumber?: string;
    trackingDate?: Date;
    isSystemGenerated?: boolean;
}
export declare class CreateVoucherDto {
    voucherTypeId?: number;
    voucherNumber: number;
    voucherDate: Date;
    description?: string;
    referenceNumber?: string;
    subNumber?: string;
    voucherNature?: string;
    description2?: string;
    sourceDocDate?: Date;
    dailyNumber?: number;
    status?: number;
    items?: CreateVoucherItemDto[];
}
