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
exports.ReceiptCheque = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const receipt_notification_entity_1 = require("./receipt-notification.entity");
const bank_entity_1 = require("./bank.entity");
const cash_entity_1 = require("./cash.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./reciept-and-payment-accounting-setting.entity");
let ReceiptCheque = class ReceiptCheque extends app_base_entity_1.AppBaseEntity {
};
exports.ReceiptCheque = ReceiptCheque;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceiptChequeID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "receiptChequeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReceiptNotificationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => receipt_notification_entity_1.ReceiptNotification, pn => pn.chequeItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ReceiptNotificationRef', referencedColumnName: 'receiptNotificationId' }),
    __metadata("design:type", receipt_notification_entity_1.ReceiptNotification)
], ReceiptCheque.prototype, "receiptNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' }),
    __metadata("design:type", reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)
], ReceiptCheque.prototype, "accountingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CashRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "cashRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cash_entity_1.Cash, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CashRef', referencedColumnName: 'cashId' }),
    __metadata("design:type", cash_entity_1.Cash)
], ReceiptCheque.prototype, "cash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "bankRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_entity_1.Bank, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'BankRef', referencedColumnName: 'bankId' }),
    __metadata("design:type", bank_entity_1.Bank)
], ReceiptCheque.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BranchName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "branchName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountNumber', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], ReceiptCheque.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : 0
        } }),
    __metadata("design:type", Number)
], ReceiptCheque.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChequeNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "chequeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Currency', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DueDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ReceiptCheque.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SayyadNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "sayyadNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EndorsementNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "endorsementNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReceiptCheque.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ReceiptCheque.prototype, "dynamicDetailedData", void 0);
exports.ReceiptCheque = ReceiptCheque = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceiptCheque' })
], ReceiptCheque);
//# sourceMappingURL=receipt-cheque.entity.js.map