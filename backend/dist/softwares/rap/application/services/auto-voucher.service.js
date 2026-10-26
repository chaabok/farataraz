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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoVoucherService = void 0;
const common_1 = require("@nestjs/common");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
const voucher_service_1 = require("../../../accounting/application/services/voucher.service");
const account_service_1 = require("../../../accounting/application/services/account.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const document_accounting_info_service_1 = require("./document-accounting-info.service");
let AutoVoucherService = class AutoVoucherService {
    constructor(baseSettingsService, voucherService, accountService, requestContextService, documentAccountingInfoService) {
        this.baseSettingsService = baseSettingsService;
        this.voucherService = voucherService;
        this.accountService = accountService;
        this.requestContextService = requestContextService;
        this.documentAccountingInfoService = documentAccountingInfoService;
    }
    async generateAutoVoucherIfNeeded(formType, status, documentDate, documentNumber, existingVoucherId, documentRef) {
        if (status !== 2 && status !== 5) {
            return existingVoucherId || null;
        }
        if (existingVoucherId) {
            return existingVoucherId;
        }
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const settings = await this.baseSettingsService.getSettingsByTab(6, companyId);
        let isAutoVoucherEnabled = false;
        let formTitle = '';
        switch (formType) {
            case 'ReceiptNotification':
                isAutoVoucherEnabled = settings['autoVoucherReceiptNotification'] === 'true' || settings['autoVoucherReceiptNotification'] === undefined;
                formTitle = 'رسید دریافت';
                break;
            case 'PaymentNotification':
                isAutoVoucherEnabled = settings['autoVoucherPaymentNotification'] === 'true' || settings['autoVoucherPaymentNotification'] === undefined;
                formTitle = 'اعلامیه پرداخت';
                break;
            case 'PettyCashSummary':
                isAutoVoucherEnabled = settings['autoVoucherPettyCashSummary'] === 'true' || settings['autoVoucherPettyCashSummary'] === undefined;
                formTitle = 'صورتخلاصه تنخواه';
                break;
            case 'PaidDocumentClearing':
                isAutoVoucherEnabled = settings['autoVoucherPaidDocumentClearing'] === 'true' || settings['autoVoucherPaidDocumentClearing'] === undefined;
                formTitle = 'وصول اسناد پرداختنی';
                break;
            case 'ReceivedChequeOperation':
                isAutoVoucherEnabled = settings['autoVoucherReceivedChequeOperation'] === 'true' || settings['autoVoucherReceivedChequeOperation'] === undefined;
                formTitle = 'عملیات چک دریافتنی';
                break;
        }
        if (!isAutoVoucherEnabled) {
            return null;
        }
        let accItems = [];
        if (documentRef) {
            await this.documentAccountingInfoService.saveDefaults(formType, documentRef);
            const result = await this.documentAccountingInfoService.getByDocumentWithAccounts(formType, documentRef);
            accItems = result.items || [];
        }
        const dto = {
            voucherNumber: 0,
            voucherDate: typeof documentDate === 'string' ? new Date(documentDate) : documentDate,
            description: `صدور سند خودکار برای فرم ${formTitle} شماره ${documentNumber}`,
            status: 1,
            items: [],
        };
        try {
            const accounts = await this.accountService.findAll(undefined, undefined, { limit: 1 });
            const firstAccountId = accounts.length > 0 ? accounts[0].id : 1;
            let rowNum = 1;
            if (accItems.length > 0) {
                for (const item of accItems) {
                    const data = item.data || {};
                    const opAccId = item.opAccountInfo?.id;
                    const forAccId = item.forAccountInfo?.id;
                    if (!opAccId || !forAccId) {
                        console.log(`AutoVoucherService: Missing opAccId (${opAccId}) or forAccId (${forAccId}) for document ${documentNumber}. Aborting auto voucher.`);
                        return null;
                    }
                    const amount = Number(item.amount || 0);
                    const opDetail1 = data.opDetail1Ref || item.suggestedOpDetailedAccountId || item.suggestedOpPartyDetailedAccountId || null;
                    const forDetail1 = data.forDetail1Ref || item.suggestedPartyDetailedAccountId || item.suggestedBankDetailedAccountId || null;
                    const isPayment = formType === 'PaymentNotification';
                    let opDebit = isPayment ? 0 : amount;
                    let opCredit = isPayment ? amount : 0;
                    let forDebit = isPayment ? amount : 0;
                    let forCredit = isPayment ? 0 : amount;
                    if (item.isReverse) {
                        const tempOpDebit = opDebit;
                        opDebit = opCredit;
                        opCredit = tempOpDebit;
                        const tempForDebit = forDebit;
                        forDebit = forCredit;
                        forCredit = tempForDebit;
                    }
                    dto.items.push({
                        rowNumber: rowNum++,
                        accountId: opAccId,
                        debit: opDebit,
                        credit: opCredit,
                        description: `ثبت خودکار بابت ${formTitle} شماره ${documentNumber} - ${item.rowType || ''}`,
                        detailedAccountId1: opDetail1,
                        detailedAccountId2: data.opDetail2Ref || null,
                        detailedAccountId3: data.opDetail3Ref || null,
                        detailedAccountId4: data.opDetail4Ref || null,
                        detailedAccountId5: data.opDetail5Ref || null,
                        detailedAccountId6: data.opDetail6Ref || null,
                        isSystemGenerated: true,
                    });
                    dto.items.push({
                        rowNumber: rowNum++,
                        accountId: forAccId,
                        debit: forDebit,
                        credit: forCredit,
                        description: `طرف حساب - ${formTitle} شماره ${documentNumber} - ${item.rowType || ''}`,
                        detailedAccountId1: forDetail1,
                        detailedAccountId2: data.forDetail2Ref || null,
                        detailedAccountId3: data.forDetail3Ref || null,
                        detailedAccountId4: data.forDetail4Ref || null,
                        detailedAccountId5: data.forDetail5Ref || null,
                        detailedAccountId6: data.forDetail6Ref || null,
                        isSystemGenerated: true,
                    });
                }
            }
            else {
                console.log(`AutoVoucherService: No accItems found for document ${documentNumber}. Aborting auto voucher.`);
                return null;
            }
            const createdVoucher = await this.voucherService.create(dto);
            if (createdVoucher && createdVoucher.voucherId) {
                return createdVoucher.voucherId;
            }
        }
        catch (e) {
            console.error('Failed to create auto voucher', e);
        }
        return null;
    }
};
exports.AutoVoucherService = AutoVoucherService;
exports.AutoVoucherService = AutoVoucherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [base_settings_service_1.BaseSettingsService,
        voucher_service_1.VoucherService,
        account_service_1.AccountService,
        request_context_service_1.RequestContextService,
        document_accounting_info_service_1.DocumentAccountingInfoService])
], AutoVoucherService);
//# sourceMappingURL=auto-voucher.service.js.map