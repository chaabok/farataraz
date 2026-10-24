import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AccountReviewController } from '../softwares/accounting/presentation/controllers/account-review.controller';
import { TrialBalanceAndLedgerReportController } from '../softwares/accounting/presentation/controllers/trial-balance-and-ledger-report.controller';

/**
 * Replaces the four former Next.js proxy routes (Task 5-a):
 *   - app/api/accounting/account-review/report-data
 *   - app/api/accounting/account-review/voucher-bounds
 *   - app/api/accounting/trial-balance-and-ledger-report/report-data
 *   - app/api/accounting/trial-balance-and-ledger-report/voucher-bounds
 *
 * The legacy Next.js routes forwarded these to the very same NestJS backend
 * over loopback HTTP. Now the gateway controller owns the public paths and
 * delegates IN-PROCESS to the underlying report controllers (retrieved via
 * ModuleRef), preserving the exact response contract the frontend expects:
 *
 *  - report-data: success passes the backend payload through verbatim
 *    ({ success, reportData, ... }); backend failures are PROPAGATED as
 *    { success: false, message } with the backend's status - never masked
 *    as an empty successful report.
 *  - voucher-bounds: success passes through; on failure the legacy default
 *    bounds payload is returned (kept for UI compatibility).
 *
 * The gateway module is registered BEFORE the software modules in
 * AppModule, so these paths are matched here and delegated below.
 */
@Controller()
export class AccountingProxyController {
  private readonly logger = new Logger(AccountingProxyController.name);

  private accountReviewController?: AccountReviewController;
  private trialBalanceController?: TrialBalanceAndLedgerReportController;

  constructor(private readonly moduleRef: ModuleRef) {}

  private getAccountReview(): AccountReviewController {
    if (!this.accountReviewController) {
      this.accountReviewController = this.moduleRef.get(AccountReviewController, { strict: false });
    }
    return this.accountReviewController;
  }

  private getTrialBalance(): TrialBalanceAndLedgerReportController {
    if (!this.trialBalanceController) {
      this.trialBalanceController = this.moduleRef.get(TrialBalanceAndLedgerReportController, { strict: false });
    }
    return this.trialBalanceController;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async propagateError(err: unknown, fallbackMessage: string): Promise<any> {
    if (err instanceof HttpException) {
      const status = err.getStatus();
      const response = err.getResponse();
      let message = fallbackMessage;
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resp = response as Record<string, any>;
        message = resp['message'] || resp['error'] || message;
        if (Array.isArray(message)) message = message[0] || fallbackMessage;
      }
      throw new HttpException({ success: false, message }, status);
    }
    this.logger.error('Accounting report error:', err instanceof Error ? err.stack : err);
    throw new HttpException({ success: false, message: fallbackMessage }, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Get('accounting/account-review/report-data')
  async accountReviewReportData(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('verticalType') verticalType?: string,
    @Query('verticalValue') verticalValue?: string,
    @Query('horizontalType') horizontalType?: string,
    @Query('fromVoucher') fromVoucher?: string,
    @Query('toVoucher') toVoucher?: string,
    @Query('includedDocs') includedDocs?: string,
    @Query('voucherStatus') voucherStatus?: string,
    @Query('hasYearFilter') hasYearFilter?: string,
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
    @Query('hasMonthFilter') hasMonthFilter?: string,
    @Query('fromMonth') fromMonth?: string,
    @Query('toMonth') toMonth?: string,
    @Query('hasDateFilter') hasDateFilter?: string,
    @Query('fromCustomDate') fromCustomDate?: string,
    @Query('toCustomDate') toCustomDate?: string,
    @Query('reportNature') reportNature?: string,
    @Query('reportVariant') reportVariant?: string,
    @Query('accountLevel') accountLevel?: string,
    @Query('columnFormat') columnFormat?: string,
    @Query('balanceType') balanceType?: string,
    @Query('filterYearRange') filterYearRange?: string,
    @Query('filterMonths') filterMonths?: string,
    @Query('filterDates') filterDates?: string,
    @Query('filterVoucherNumbers') filterVoucherNumbers?: string,
    @Query('docTypes') docTypes?: string,
    @Query('statuses') statuses?: string,
    @Query('search') search?: string,
    @Query('priorities') priorities?: string,
    @Query('companyRef') companyRef?: string,
    @Query('businessStructureRef') businessStructureRef?: string,
  ) {
    try {
      return await this.getAccountReview().getReportData(
        fromDate,
        toDate,
        verticalType,
        verticalValue,
        horizontalType,
        fromVoucher,
        toVoucher,
        includedDocs,
        voucherStatus,
        hasYearFilter,
        fromYear,
        toYear,
        hasMonthFilter,
        fromMonth,
        toMonth,
        hasDateFilter,
        fromCustomDate,
        toCustomDate,
        reportNature,
        reportVariant,
        accountLevel,
        columnFormat,
        balanceType,
        filterYearRange,
        filterMonths,
        filterDates,
        filterVoucherNumbers,
        docTypes,
        statuses,
        search,
        priorities,
        companyRef,
        businessStructureRef,
      );
    } catch (err) {
      return this.propagateError(err, 'خطا در دریافت داده‌های گزارش از سرور');
    }
  }

  @Get('accounting/account-review/voucher-bounds')
  async accountReviewVoucherBounds(
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
    @Query('companyRef') companyRef?: string,
    @Query('businessStructureRef') businessStructureRef?: string,
  ) {
    try {
      return await this.getAccountReview().getVoucherBounds(fromYear, toYear, companyRef, businessStructureRef);
    } catch (err) {
      return this.voucherBoundsFallback(err, fromYear, toYear);
    }
  }

  @Get('accounting/trial-balance-and-ledger-report/report-data')
  async trialBalanceReportData(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('verticalType') verticalType?: string,
    @Query('verticalValue') verticalValue?: string,
    @Query('horizontalType') horizontalType?: string,
    @Query('fromVoucher') fromVoucher?: string,
    @Query('toVoucher') toVoucher?: string,
    @Query('includedDocs') includedDocs?: string,
    @Query('voucherStatus') voucherStatus?: string,
    @Query('hasYearFilter') hasYearFilter?: string,
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
    @Query('hasMonthFilter') hasMonthFilter?: string,
    @Query('fromMonth') fromMonth?: string,
    @Query('toMonth') toMonth?: string,
    @Query('hasDateFilter') hasDateFilter?: string,
    @Query('fromCustomDate') fromCustomDate?: string,
    @Query('toCustomDate') toCustomDate?: string,
    @Query('reportNature') reportNature?: string,
    @Query('reportVariant') reportVariant?: string,
    @Query('accountLevel') accountLevel?: string,
    @Query('columnFormat') columnFormat?: string,
    @Query('balanceType') balanceType?: string,
    @Query('filterYearRange') filterYearRange?: string,
    @Query('filterMonths') filterMonths?: string,
    @Query('filterDates') filterDates?: string,
    @Query('filterVoucherNumbers') filterVoucherNumbers?: string,
    @Query('docTypes') docTypes?: string,
    @Query('statuses') statuses?: string,
    @Query('search') search?: string,
    @Query('priorities') priorities?: string,
    @Query('companyRef') companyRef?: string,
    @Query('businessStructureRef') businessStructureRef?: string,
  ) {
    try {
      return await this.getTrialBalance().getReportData(
        fromDate,
        toDate,
        verticalType,
        verticalValue,
        horizontalType,
        fromVoucher,
        toVoucher,
        includedDocs,
        voucherStatus,
        hasYearFilter,
        fromYear,
        toYear,
        hasMonthFilter,
        fromMonth,
        toMonth,
        hasDateFilter,
        fromCustomDate,
        toCustomDate,
        reportNature,
        reportVariant,
        accountLevel,
        columnFormat,
        balanceType,
        filterYearRange,
        filterMonths,
        filterDates,
        filterVoucherNumbers,
        docTypes,
        statuses,
        search,
        priorities,
        companyRef,
        businessStructureRef,
      );
    } catch (err) {
      return this.propagateError(err, 'خطا در دریافت داده‌های گزارش از سرور');
    }
  }

  @Get('accounting/trial-balance-and-ledger-report/voucher-bounds')
  async trialBalanceVoucherBounds(
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
    @Query('companyRef') companyRef?: string,
    @Query('businessStructureRef') businessStructureRef?: string,
  ) {
    try {
      return await this.getTrialBalance().getVoucherBounds(fromYear, toYear, companyRef, businessStructureRef);
    } catch (err) {
      return this.voucherBoundsFallback(err, fromYear, toYear);
    }
  }

  /**
   * Legacy parity: when the backend report cannot produce voucher bounds,
   * the UI previously received a default fiscal-year-wide bounds payload.
   * Kept (as in the Phase-0 Next route) so report forms still open; real
   * failures are logged server-side.
   */
  private voucherBoundsFallback(err: unknown, fromYear?: string, toYear?: string) {
    this.logger.error(
      'Voucher-bounds failed, returning legacy default bounds:',
      err instanceof Error ? err.stack : err,
    );
    const from = fromYear || '1405';
    const to = toYear || '1405';
    return {
      success: true,
      fromMonth: 'فروردین',
      toMonth: 'اسفند',
      fromDate: `${from}/01/01`,
      toDate: `${to}/12/29`,
      fromVoucher: '1',
      toVoucher: '9999',
    };
  }
}
