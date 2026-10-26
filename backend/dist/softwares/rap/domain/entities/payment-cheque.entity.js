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
exports.PaymentCheque = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const payment_notification_entity_1 = require("./payment-notification.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./reciept-and-payment-accounting-setting.entity");
const chequebook_entity_1 = require("./chequebook.entity");
let PaymentCheque = class PaymentCheque extends app_base_entity_1.AppBaseEntity {
};
exports.PaymentCheque = PaymentCheque;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaymentChequeID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "paymentChequeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentNotificationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "paymentNotificationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_notification_entity_1.PaymentNotification, pn => pn.chequeItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PaymentNotificationRef', referencedColumnName: 'paymentNotificationId' }),
    __metadata("design:type", payment_notification_entity_1.PaymentNotification)
], PaymentCheque.prototype, "paymentNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' }),
    __metadata("design:type", reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)
], PaymentCheque.prototype, "accountingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankAccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "bankAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], PaymentCheque.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChequebookRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "chequebookRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chequebook_entity_1.Chequebook, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ChequebookRef', referencedColumnName: 'chequebookId' }),
    __metadata("design:type", chequebook_entity_1.Chequebook)
], PaymentCheque.prototype, "chequebook", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], PaymentCheque.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : 0
        } }),
    __metadata("design:type", Number)
], PaymentCheque.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChequeNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentCheque.prototype, "chequeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Currency', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentCheque.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DueDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PaymentCheque.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SayyadNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentCheque.prototype, "sayyadNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EndorsementNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentCheque.prototype, "endorsementNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentCheque.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentCheque.prototype, "dynamicDetailedData", void 0);
exports.PaymentCheque = PaymentCheque = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaymentCheque' })
], PaymentCheque);
//# sourceMappingURL=payment-cheque.entity.js.map