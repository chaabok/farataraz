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
exports.ReceiptGuarantee = void 0;
const guarantee_type_enum_1 = require("./guarantee-type.enum");
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const receipt_notification_entity_1 = require("./receipt-notification.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./reciept-and-payment-accounting-setting.entity");
const cash_entity_1 = require("./cash.entity");
const bank_entity_1 = require("./bank.entity");
let ReceiptGuarantee = class ReceiptGuarantee extends app_base_entity_1.AppBaseEntity {
};
exports.ReceiptGuarantee = ReceiptGuarantee;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceiptGuaranteeID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "receiptGuaranteeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReceiptNotificationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => receipt_notification_entity_1.ReceiptNotification, pn => pn.guaranteeItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ReceiptNotificationRef', referencedColumnName: 'receiptNotificationId' }),
    __metadata("design:type", receipt_notification_entity_1.ReceiptNotification)
], ReceiptGuarantee.prototype, "receiptNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' }),
    __metadata("design:type", reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)
], ReceiptGuarantee.prototype, "accountingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CashRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "cashRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cash_entity_1.Cash, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CashRef', referencedColumnName: 'cashId' }),
    __metadata("design:type", cash_entity_1.Cash)
], ReceiptGuarantee.prototype, "cash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], ReceiptGuarantee.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : 0
        } }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GuaranteeNumber', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], ReceiptGuarantee.prototype, "guaranteeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GuaranteeType', type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "guaranteeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseDocument', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ReceiptGuarantee.prototype, "baseDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReceiptGuarantee.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptGuarantee.prototype, "bankRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_entity_1.Bank, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'BankRef', referencedColumnName: 'bankId' }),
    __metadata("design:type", bank_entity_1.Bank)
], ReceiptGuarantee.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountNumber', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ReceiptGuarantee.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NotificationDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ReceiptGuarantee.prototype, "notificationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ReceiptGuarantee.prototype, "dynamicDetailedData", void 0);
exports.ReceiptGuarantee = ReceiptGuarantee = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceiptGuarantee' })
], ReceiptGuarantee);
//# sourceMappingURL=receipt-guarantee.entity.js.map