"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AccountingProxyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingProxyController = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const account_review_controller_1 = require("../softwares/accounting/presentation/controllers/account-review.controller");
const trial_balance_and_ledger_report_controller_1 = require("../softwares/accounting/presentation/controllers/trial-balance-and-ledger-report.controller");
let AccountingProxyController = AccountingProxyController_1 = class AccountingProxyController {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger(AccountingProxyController_1.name);
    }
    getAccountReview() {
        if (!this.accountReviewController) {
            this.accountReviewController = this.moduleRef.get(account_review_controller_1.AccountReviewController, { strict: false });
        }
        return this.accountReviewController;
    }
    getTrialBalance() {
        if (!this.trialBalanceController) {
            this.trialBalanceController = this.moduleRef.get(trial_balance_and_ledger_report_controller_1.TrialBalanceAndLedgerReportController, { strict: false });
        }
        return this.trialBalanceController;
    }
    async propagateError(err, fallbackMessage) {
        if (err instanceof common_1.HttpException) {
            const status = err.getStatus();
            const response = err.getResponse();
            let message = fallbackMessage;
            if (typeof response === 'string') {
                message = response;
            }
            else if (response && typeof response === 'object') {
                const resp = response;
                message = resp['message'] || resp['error'] || message;
                if (Array.isArray(message))
                    message = message[0] || fallbackMessage;
            }
            throw new common_1.HttpException({ success: false, message }, status);
        }
        this.logger.error('Accounting report error:', err instanceof Error ? err.stack : err);
        throw new common_1.HttpException({ success: false, message: fallbackMessage }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async accountReviewReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocs, voucherStatus, hasYearFilter, fromYear, toYear, hasMonthFilter, fromMonth, toMonth, hasDateFilter, fromCustomDate, toCustomDate, reportNature, reportVariant, accountLevel, columnFormat, balanceType, filterYearRange, filterMonths, filterDates, filterVoucherNumbers, docTypes, statuses, search, priorities, companyRef, businessStructureRef) {
        try {
            return await this.getAccountReview().getReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocs, voucherStatus, hasYearFilter, fromYear, toYear, hasMonthFilter, fromMonth, toMonth, hasDateFilter, fromCustomDate, toCustomDate, reportNature, reportVariant, accountLevel, columnFormat, balanceType, filterYearRange, filterMonths, filterDates, filterVoucherNumbers, docTypes, statuses, search, priorities, companyRef, businessStructureRef);
        }
        catch (err) {
            return this.propagateError(err, 'خطا در دریافت داده‌های گزارش از سرور');
        }
    }
    async accountReviewVoucherBounds(fromYear, toYear, companyRef, businessStructureRef) {
        try {
            return await this.getAccountReview().getVoucherBounds(fromYear, toYear, companyRef, businessStructureRef);
        }
        catch (err) {
            return this.voucherBoundsFallback(err, fromYear, toYear);
        }
    }
    async trialBalanceReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocs, voucherStatus, hasYearFilter, fromYear, toYear, hasMonthFilter, fromMonth, toMonth, hasDateFilter, fromCustomDate, toCustomDate, reportNature, reportVariant, accountLevel, columnFormat, balanceType, filterYearRange, filterMonths, filterDates, filterVoucherNumbers, docTypes, statuses, search, priorities, companyRef, businessStructureRef) {
        try {
            return await this.getTrialBalance().getReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocs, voucherStatus, hasYearFilter, fromYear, toYear, hasMonthFilter, fromMonth, toMonth, hasDateFilter, fromCustomDate, toCustomDate, reportNature, reportVariant, accountLevel, columnFormat, balanceType, filterYearRange, filterMonths, filterDates, filterVoucherNumbers, docTypes, statuses, search, priorities, companyRef, businessStructureRef);
        }
        catch (err) {
            return this.propagateError(err, 'خطا در دریافت داده‌های گزارش از سرور');
        }
    }
    async trialBalanceVoucherBounds(fromYear, toYear, companyRef, businessStructureRef) {
        try {
            return await this.getTrialBalance().getVoucherBounds(fromYear, toYear, companyRef, businessStructureRef);
        }
        catch (err) {
            return this.voucherBoundsFallback(err, fromYear, toYear);
        }
    }
    voucherBoundsFallback(err, fromYear, toYear) {
        this.logger.error('Voucher-bounds failed, returning legacy default bounds:', err instanceof Error ? err.stack : err);
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
};
exports.AccountingProxyController = AccountingProxyController;
__decorate([
    (0, common_1.Get)('accounting/account-review/report-data'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('verticalType')),
    __param(3, (0, common_1.Query)('verticalValue')),
    __param(4, (0, common_1.Query)('horizontalType')),
    __param(5, (0, common_1.Query)('fromVoucher')),
    __param(6, (0, common_1.Query)('toVoucher')),
    __param(7, (0, common_1.Query)('includedDocs')),
    __param(8, (0, common_1.Query)('voucherStatus')),
    __param(9, (0, common_1.Query)('hasYearFilter')),
    __param(10, (0, common_1.Query)('fromYear')),
    __param(11, (0, common_1.Query)('toYear')),
    __param(12, (0, common_1.Query)('hasMonthFilter')),
    __param(13, (0, common_1.Query)('fromMonth')),
    __param(14, (0, common_1.Query)('toMonth')),
    __param(15, (0, common_1.Query)('hasDateFilter')),
    __param(16, (0, common_1.Query)('fromCustomDate')),
    __param(17, (0, common_1.Query)('toCustomDate')),
    __param(18, (0, common_1.Query)('reportNature')),
    __param(19, (0, common_1.Query)('reportVariant')),
    __param(20, (0, common_1.Query)('accountLevel')),
    __param(21, (0, common_1.Query)('columnFormat')),
    __param(22, (0, common_1.Query)('balanceType')),
    __param(23, (0, common_1.Query)('filterYearRange')),
    __param(24, (0, common_1.Query)('filterMonths')),
    __param(25, (0, common_1.Query)('filterDates')),
    __param(26, (0, common_1.Query)('filterVoucherNumbers')),
    __param(27, (0, common_1.Query)('docTypes')),
    __param(28, (0, common_1.Query)('statuses')),
    __param(29, (0, common_1.Query)('search')),
    __param(30, (0, common_1.Query)('priorities')),
    __param(31, (0, common_1.Query)('companyRef')),
    __param(32, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingProxyController.prototype, "accountReviewReportData", null);
__decorate([
    (0, common_1.Get)('accounting/account-review/voucher-bounds'),
    __param(0, (0, common_1.Query)('fromYear')),
    __param(1, (0, common_1.Query)('toYear')),
    __param(2, (0, common_1.Query)('companyRef')),
    __param(3, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingProxyController.prototype, "accountReviewVoucherBounds", null);
__decorate([
    (0, common_1.Get)('accounting/trial-balance-and-ledger-report/report-data'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('verticalType')),
    __param(3, (0, common_1.Query)('verticalValue')),
    __param(4, (0, common_1.Query)('horizontalType')),
    __param(5, (0, common_1.Query)('fromVoucher')),
    __param(6, (0, common_1.Query)('toVoucher')),
    __param(7, (0, common_1.Query)('includedDocs')),
    __param(8, (0, common_1.Query)('voucherStatus')),
    __param(9, (0, common_1.Query)('hasYearFilter')),
    __param(10, (0, common_1.Query)('fromYear')),
    __param(11, (0, common_1.Query)('toYear')),
    __param(12, (0, common_1.Query)('hasMonthFilter')),
    __param(13, (0, common_1.Query)('fromMonth')),
    __param(14, (0, common_1.Query)('toMonth')),
    __param(15, (0, common_1.Query)('hasDateFilter')),
    __param(16, (0, common_1.Query)('fromCustomDate')),
    __param(17, (0, common_1.Query)('toCustomDate')),
    __param(18, (0, common_1.Query)('reportNature')),
    __param(19, (0, common_1.Query)('reportVariant')),
    __param(20, (0, common_1.Query)('accountLevel')),
    __param(21, (0, common_1.Query)('columnFormat')),
    __param(22, (0, common_1.Query)('balanceType')),
    __param(23, (0, common_1.Query)('filterYearRange')),
    __param(24, (0, common_1.Query)('filterMonths')),
    __param(25, (0, common_1.Query)('filterDates')),
    __param(26, (0, common_1.Query)('filterVoucherNumbers')),
    __param(27, (0, common_1.Query)('docTypes')),
    __param(28, (0, common_1.Query)('statuses')),
    __param(29, (0, common_1.Query)('search')),
    __param(30, (0, common_1.Query)('priorities')),
    __param(31, (0, common_1.Query)('companyRef')),
    __param(32, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingProxyController.prototype, "trialBalanceReportData", null);
__decorate([
    (0, common_1.Get)('accounting/trial-balance-and-ledger-report/voucher-bounds'),
    __param(0, (0, common_1.Query)('fromYear')),
    __param(1, (0, common_1.Query)('toYear')),
    __param(2, (0, common_1.Query)('companyRef')),
    __param(3, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingProxyController.prototype, "trialBalanceVoucherBounds", null);
exports.AccountingProxyController = AccountingProxyController = AccountingProxyController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], AccountingProxyController);
//# sourceMappingURL=accounting-proxy.controller.js.map