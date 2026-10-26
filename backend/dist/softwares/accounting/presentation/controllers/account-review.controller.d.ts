import { Repository } from 'typeorm';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { VoucherItem } from '../../domain/entities/voucher-item.entity';
import { Account } from '../../domain/entities/account.entity';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
export declare class AccountReviewController {
    private readonly voucherItemRepository;
    private readonly accountRepository;
    private readonly detailedAccountRepository;
    private readonly currencyRepository;
    private readonly requestContextService;
    constructor(voucherItemRepository: Repository<VoucherItem>, accountRepository: Repository<Account>, detailedAccountRepository: Repository<DetailedAccount>, currencyRepository: Repository<Currency>, requestContextService: RequestContextService);
    private getScope;
    getSidebarItems(type: string): Promise<{
        id: any;
        code: string;
        name: any;
    }[]>;
    getVoucherBounds(fromYear?: string, toYear?: string, companyRefStr?: string, businessStructureRefStr?: string): Promise<{
        success: boolean;
        hasVouchers: boolean;
        fromMonth: string;
        toMonth: string;
        fromDate: string;
        toDate: string;
        fromVoucher: string;
        toVoucher: string;
    }>;
    getReportData(fromDate?: string, toDate?: string, verticalType?: string, verticalValue?: string, horizontalType?: string, fromVoucher?: string, toVoucher?: string, includedDocsStr?: string, voucherStatusStr?: string, hasYearFilterStr?: string, fromYear?: string, toYear?: string, hasMonthFilterStr?: string, fromMonth?: string, toMonth?: string, hasDateFilterStr?: string, fromCustomDate?: string, toCustomDate?: string, reportNature?: string, reportVariant?: string, accountLevel?: string, columnFormat?: string, balanceType?: string, filterYearRangeStr?: string, filterMonthsStr?: string, filterDatesStr?: string, filterVoucherNumbersStr?: string, docTypesStr?: string, statusesStr?: string, searchStr?: string, prioritiesStr?: string, companyRefStr?: string, businessStructureRefStr?: string, isInternalCall?: boolean): Promise<{
        success: boolean;
        reportData: {
            id: number;
            rowNo: number;
            voucherNumber: number;
            referenceNumber: string | number;
            subNumber: string | number;
            voucherDate: string | Date;
            description: string;
            description2: string;
            debit: number;
            credit: number;
            runningBalance: number;
            balanceType: string;
            currency: string;
            currencyDebit: number;
            currencyCredit: number;
            trackingNumber: string;
            trackingDate: string | Date;
            accountCode: any;
            accountTitle: any;
            accountTitle2: any;
            parentCode: string;
            parentTitle: string;
            accountLevel: string;
            docType: string;
            status: string;
        }[];
        horizontalConfig?: undefined;
        rawItemsForTableWithKeys?: undefined;
    } | {
        success: boolean;
        reportData: {
            id: any;
            rowNo: number;
            accountCode: any;
            accountTitle: any;
            accountTitle2: any;
            parentCode: any;
            parentTitle: any;
            debit: any;
            credit: any;
            debitBalance: number;
            creditBalance: number;
            debitTurnover: any;
            creditTurnover: any;
            debitPriorTurnover: any;
            creditPriorTurnover: any;
            debitPeriodTurnover: any;
            creditPeriodTurnover: any;
            col1Debit: any;
            col1Credit: any;
            col2Debit: any;
            col2Credit: any;
            col3Debit: any;
            col3Credit: any;
            col4Debit: number;
            col4Credit: number;
        }[];
        horizontalConfig?: undefined;
        rawItemsForTableWithKeys?: undefined;
    } | {
        success: boolean;
        reportData: {
            id: string;
            code: string;
            title: string;
            debit: number;
            credit: number;
            balance: number;
            balanceType: string;
        }[];
        horizontalConfig: any;
        rawItemsForTableWithKeys: any[];
    }>;
    getHistory(fromDate: string, toDate: string, verticalType: string, verticalValue: string, horizontalType: string, fromVoucher: string, toVoucher: string, includedDocsStr: string, voucherStatusStr: string, hasYearFilterStr: string, fromYear: string, toYear: string, hasMonthFilterStr: string, fromMonth: string, toMonth: string, hasDateFilterStr: string, fromCustomDate: string, toCustomDate: string, selectedId: string): Promise<{
        success: boolean;
        reportData: {
            id: any;
            voucherId: any;
            issueDate: string;
            voucherNumber: any;
            dailyNumber: any;
            accountCode: any;
            accountTitle: any;
            description: any;
            debit: number;
            credit: number;
            runningBalance: number;
            runningBalanceType: string;
            currencyName: string;
            currencyAmount: any;
            currencyRate: any;
            trackingNumber: any;
            trackingDate: string;
            creatorName: string;
        }[];
    }>;
}
