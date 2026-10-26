import { ModuleRef } from '@nestjs/core';
export declare class AccountingProxyController {
    private readonly moduleRef;
    private readonly logger;
    private accountReviewController?;
    private trialBalanceController?;
    constructor(moduleRef: ModuleRef);
    private getAccountReview;
    private getTrialBalance;
    private propagateError;
    accountReviewReportData(fromDate?: string, toDate?: string, verticalType?: string, verticalValue?: string, horizontalType?: string, fromVoucher?: string, toVoucher?: string, includedDocs?: string, voucherStatus?: string, hasYearFilter?: string, fromYear?: string, toYear?: string, hasMonthFilter?: string, fromMonth?: string, toMonth?: string, hasDateFilter?: string, fromCustomDate?: string, toCustomDate?: string, reportNature?: string, reportVariant?: string, accountLevel?: string, columnFormat?: string, balanceType?: string, filterYearRange?: string, filterMonths?: string, filterDates?: string, filterVoucherNumbers?: string, docTypes?: string, statuses?: string, search?: string, priorities?: string, companyRef?: string, businessStructureRef?: string): Promise<any>;
    accountReviewVoucherBounds(fromYear?: string, toYear?: string, companyRef?: string, businessStructureRef?: string): Promise<{
        success: boolean;
        fromMonth: string;
        toMonth: string;
        fromDate: string;
        toDate: string;
        fromVoucher: string;
        toVoucher: string;
    }>;
    trialBalanceReportData(fromDate?: string, toDate?: string, verticalType?: string, verticalValue?: string, horizontalType?: string, fromVoucher?: string, toVoucher?: string, includedDocs?: string, voucherStatus?: string, hasYearFilter?: string, fromYear?: string, toYear?: string, hasMonthFilter?: string, fromMonth?: string, toMonth?: string, hasDateFilter?: string, fromCustomDate?: string, toCustomDate?: string, reportNature?: string, reportVariant?: string, accountLevel?: string, columnFormat?: string, balanceType?: string, filterYearRange?: string, filterMonths?: string, filterDates?: string, filterVoucherNumbers?: string, docTypes?: string, statuses?: string, search?: string, priorities?: string, companyRef?: string, businessStructureRef?: string): Promise<any>;
    trialBalanceVoucherBounds(fromYear?: string, toYear?: string, companyRef?: string, businessStructureRef?: string): Promise<{
        success: boolean;
        fromMonth: string;
        toMonth: string;
        fromDate: string;
        toDate: string;
        fromVoucher: string;
        toVoucher: string;
    }>;
    private voucherBoundsFallback;
}
