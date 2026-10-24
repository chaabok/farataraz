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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentNotificationService = void 0;
const common_1 = require("@nestjs/common");
const document_accounting_info_service_1 = require("./document-accounting-info.service");
const payment_notification_repository_interface_1 = require("../../domain/repositories/payment-notification.repository.interface");
const auto_voucher_service_1 = require("./auto-voucher.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
function parseToJalaliStr(date) {
    if (!date)
        return '';
    if (date instanceof Date) {
        return (0, moment_jalaali_1.default)(date).format('jYYYY/jMM/jDD');
    }
    if (typeof date === 'string') {
        const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const aDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const cleanStr = date
            .replace(/[۰-۹]/g, w => pDigits.indexOf(w).toString())
            .replace(/[٠-٩]/g, w => aDigits.indexOf(w).toString())
            .replace(/-/g, '/');
        const match = cleanStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            if (year >= 1300 && year < 1500) {
                const m = (0, moment_jalaali_1.default)(cleanStr, 'jYYYY/jMM/jDD');
                if (m.isValid())
                    return m.format('jYYYY/jMM/jDD');
            }
            else {
                const m = (0, moment_jalaali_1.default)(cleanStr, 'YYYY/MM/DD');
                if (m.isValid())
                    return m.format('jYYYY/jMM/jDD');
            }
        }
        const m = (0, moment_jalaali_1.default)(cleanStr);
        if (m.isValid()) {
            return m.format('jYYYY/jMM/jDD');
        }
    }
    return '';
}
let PaymentNotificationService = class PaymentNotificationService {
    constructor(repository, requestContextService, autoVoucherService, documentAccountingInfoService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.autoVoucherService = autoVoucherService;
        this.documentAccountingInfoService = documentAccountingInfoService;
    }
    getScope() {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        return { businessStructureId, companyId };
    }
    async findAll() {
        const { businessStructureId, companyId } = this.getScope();
        return this.repository.findAll(businessStructureId, companyId);
    }
    async findOne(id) {
        const { businessStructureId, companyId } = this.getScope();
        const notification = await this.repository.findById(id, businessStructureId, companyId);
        if (!notification) {
            throw new common_1.NotFoundException(`Payment Notification with ID ${id} not found`);
        }
        return notification;
    }
    async getNextNumbers(jalaliDateStr) {
        const { businessStructureId, companyId } = this.getScope();
        let dateStr = parseToJalaliStr(jalaliDateStr);
        if (!dateStr) {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        return {
            documentNumber: docRes.nextValue,
            isDocumentNumberAuto: docRes.numberingMethod === '2',
            error: docRes.error || null,
        };
    }
    async getPayableCheques() {
        const { businessStructureId, companyId } = this.getScope();
        return this.repository.findPayableCheques(businessStructureId, companyId);
    }
    async getPayablePromissoryNotes() {
        const { businessStructureId, companyId } = this.getScope();
        return this.repository.findPayablePromissoryNotes(businessStructureId, companyId);
    }
    async create(createPaymentNotificationDto) {
        if (!createPaymentNotificationDto.cashItems?.length && !createPaymentNotificationDto.chequeItems?.length && !createPaymentNotificationDto.withdrawalItems?.length && !createPaymentNotificationDto.assignmentItems?.length && !createPaymentNotificationDto.promissoryNoteItems?.length && !createPaymentNotificationDto.returnedReceivedCheques?.length && !createPaymentNotificationDto.returnedReceivedPromissoryNotes?.length && !createPaymentNotificationDto.guaranteeItems?.length) {
            throw new common_1.BadRequestException('اعلامیه پرداخت باید حداقل یک قلم (نقد، چک، اعلامیه برداشت یا واگذاری به غیر) داشته باشد.');
        }
        const { businessStructureId, companyId } = this.getScope();
        let dateStr = '';
        if (createPaymentNotificationDto.documentDate) {
            dateStr = parseToJalaliStr(createPaymentNotificationDto.documentDate);
        }
        else {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.error) {
            throw new Error(docRes.error);
        }
        if (docRes.numberingMethod === '2' || !createPaymentNotificationDto.documentNumber) {
            createPaymentNotificationDto.documentNumber = docRes.nextValue;
        }
        if (!createPaymentNotificationDto.fiscalYearRef) {
            createPaymentNotificationDto.fiscalYearRef = this.requestContextService.getFiscalYearId() || 1;
        }
        const saved = await this.repository.create(createPaymentNotificationDto, businessStructureId, companyId);
        if (saved?.status === 2 || saved?.status === 5) {
            await this.documentAccountingInfoService.saveDefaults('PaymentNotification', saved.paymentNotificationId);
        }
        const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded('PaymentNotification', saved.status, saved.documentDate, saved.documentNumber, saved.voucherHeaderRef, saved.paymentNotificationId);
        if (voucherId) {
            await this.repository.update(saved.paymentNotificationId, { voucherHeaderRef: voucherId }, businessStructureId, companyId);
        }
        return this.findOne(saved.paymentNotificationId);
    }
    async update(id, updatePaymentNotificationDto) {
        if (updatePaymentNotificationDto.cashItems || updatePaymentNotificationDto.chequeItems || updatePaymentNotificationDto.withdrawalItems || updatePaymentNotificationDto.assignmentItems || updatePaymentNotificationDto.promissoryNoteItems || updatePaymentNotificationDto.returnedReceivedCheques || updatePaymentNotificationDto.returnedReceivedPromissoryNotes || updatePaymentNotificationDto.guaranteeItems) {
            if (!updatePaymentNotificationDto.cashItems?.length && !updatePaymentNotificationDto.chequeItems?.length && !updatePaymentNotificationDto.withdrawalItems?.length && !updatePaymentNotificationDto.assignmentItems?.length && !updatePaymentNotificationDto.promissoryNoteItems?.length && !updatePaymentNotificationDto.returnedReceivedCheques?.length && !updatePaymentNotificationDto.returnedReceivedPromissoryNotes?.length && !updatePaymentNotificationDto.guaranteeItems?.length) {
                throw new common_1.BadRequestException('اعلامیه پرداخت باید حداقل یک قلم (نقد، چک، اعلامیه برداشت یا واگذاری به غیر) داشته باشد.');
            }
        }
        const { businessStructureId, companyId } = this.getScope();
        const existing = await this.repository.findById(id, businessStructureId, companyId);
        if (!existing) {
            throw new common_1.NotFoundException(`Payment Notification with ID ${id} not found`);
        }
        let dateStr = '';
        if (updatePaymentNotificationDto.documentDate) {
            dateStr = parseToJalaliStr(updatePaymentNotificationDto.documentDate);
        }
        else if (existing.documentDate) {
            dateStr = parseToJalaliStr(existing.documentDate);
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.numberingMethod === '2') {
            updatePaymentNotificationDto.documentNumber = existing.documentNumber;
        }
        if (!updatePaymentNotificationDto.fiscalYearRef) {
            updatePaymentNotificationDto.fiscalYearRef = this.requestContextService.getFiscalYearId() || 1;
        }
        await this.repository.update(id, updatePaymentNotificationDto, businessStructureId, companyId);
        const updated = await this.repository.findById(id, businessStructureId, companyId);
        if (updated) {
            if (updated?.status === 2 || updated?.status === 5) {
                await this.documentAccountingInfoService.saveDefaults('PaymentNotification', updated.paymentNotificationId);
            }
            const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded('PaymentNotification', updated.status, updated.documentDate, updated.documentNumber, updated.voucherHeaderRef, updated.paymentNotificationId);
            if (voucherId && voucherId !== updated.voucherHeaderRef) {
                await this.repository.update(id, { voucherHeaderRef: voucherId }, businessStructureId, companyId);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const { businessStructureId, companyId } = this.getScope();
        return this.repository.remove(id, businessStructureId, companyId);
    }
};
exports.PaymentNotificationService = PaymentNotificationService;
exports.PaymentNotificationService = PaymentNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(payment_notification_repository_interface_1.IPaymentNotificationRepositoryToken)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => document_accounting_info_service_1.DocumentAccountingInfoService))),
    __metadata("design:paramtypes", [Object, request_context_service_1.RequestContextService,
        auto_voucher_service_1.AutoVoucherService,
        document_accounting_info_service_1.DocumentAccountingInfoService])
], PaymentNotificationService);
//# sourceMappingURL=payment-notification.service.js.map