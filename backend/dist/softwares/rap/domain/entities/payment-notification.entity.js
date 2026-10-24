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
exports.PaymentNotification = exports.PaymentNotificationType = exports.PaymentNotificationBaseType = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
const voucher_entity_1 = require("../../../accounting/domain/entities/voucher.entity");
const payment_cash_entity_1 = require("./payment-cash.entity");
const payment_cheque_entity_1 = require("./payment-cheque.entity");
const payment_withdrawal_entity_1 = require("./payment-withdrawal.entity");
const payment_assignment_entity_1 = require("./payment-assignment.entity");
const payment_promissory_note_entity_1 = require("./payment-promissory-note.entity");
const payment_returned_received_cheque_entity_1 = require("./payment-returned-received-cheque.entity");
const payment_returned_received_promissory_note_entity_1 = require("./payment-returned-received-promissory-note.entity");
const payment_guarantee_entity_1 = require("./payment-guarantee.entity");
var PaymentNotificationBaseType;
(function (PaymentNotificationBaseType) {
    PaymentNotificationBaseType[PaymentNotificationBaseType["NoBase"] = 1] = "NoBase";
    PaymentNotificationBaseType[PaymentNotificationBaseType["AccountingVoucher"] = 2] = "AccountingVoucher";
    PaymentNotificationBaseType[PaymentNotificationBaseType["PaymentOrder"] = 3] = "PaymentOrder";
    PaymentNotificationBaseType[PaymentNotificationBaseType["SalaryPayment"] = 4] = "SalaryPayment";
    PaymentNotificationBaseType[PaymentNotificationBaseType["PettyCashRequest"] = 5] = "PettyCashRequest";
    PaymentNotificationBaseType[PaymentNotificationBaseType["PurchaseInvoice"] = 6] = "PurchaseInvoice";
    PaymentNotificationBaseType[PaymentNotificationBaseType["SalesReturn"] = 7] = "SalesReturn";
    PaymentNotificationBaseType[PaymentNotificationBaseType["PartySettlement"] = 8] = "PartySettlement";
})(PaymentNotificationBaseType || (exports.PaymentNotificationBaseType = PaymentNotificationBaseType = {}));
var PaymentNotificationType;
(function (PaymentNotificationType) {
    PaymentNotificationType[PaymentNotificationType["ObligationsSettlement"] = 1] = "ObligationsSettlement";
    PaymentNotificationType[PaymentNotificationType["PettyCashCharge"] = 2] = "PettyCashCharge";
    PaymentNotificationType[PaymentNotificationType["BankToBank"] = 3] = "BankToBank";
    PaymentNotificationType[PaymentNotificationType["BankToCash"] = 4] = "BankToCash";
    PaymentNotificationType[PaymentNotificationType["CashToBank"] = 5] = "CashToBank";
    PaymentNotificationType[PaymentNotificationType["CashToCash"] = 6] = "CashToCash";
})(PaymentNotificationType || (exports.PaymentNotificationType = PaymentNotificationType = {}));
let PaymentNotification = class PaymentNotification extends app_base_entity_1.AppBaseEntity {
};
exports.PaymentNotification = PaymentNotification;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaymentNotificationID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "paymentNotificationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseType', type: 'int', nullable: false, default: 1 }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "baseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentNotification.prototype, "baseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentType', type: 'int', nullable: false, default: 1 }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentNumber', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], PaymentNotification.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentDate', type: 'date', nullable: false }),
    __metadata("design:type", Date)
], PaymentNotification.prototype, "documentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PartyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "partyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'PartyRef', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], PaymentNotification.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "currencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CurrencyRef', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], PaymentNotification.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_entity_1.Voucher, { eager: true, nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' }),
    __metadata("design:type", voucher_entity_1.Voucher)
], PaymentNotification.prototype, "voucherHeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ExchangeRate', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentNotification.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_cash_entity_1.PaymentCash, cash => cash.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "cashItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_cheque_entity_1.PaymentCheque, cheque => cheque.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "chequeItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_withdrawal_entity_1.PaymentWithdrawal, withdrawal => withdrawal.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "withdrawalItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_assignment_entity_1.PaymentAssignment, assignment => assignment.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "assignmentItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_promissory_note_entity_1.PaymentPromissoryNote, promissoryNote => promissoryNote.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "promissoryNoteItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_guarantee_entity_1.PaymentGuarantee, rg => rg.paymentNotification, { cascade: ["insert", "update", "remove"] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "guaranteeItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_returned_received_cheque_entity_1.PaymentReturnedReceivedCheque, returnedCheque => returnedCheque.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "returnedReceivedCheques", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_returned_received_promissory_note_entity_1.PaymentReturnedReceivedPromissoryNote, returnedPromissoryNote => returnedPromissoryNote.paymentNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], PaymentNotification.prototype, "returnedReceivedPromissoryNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1 }),
    __metadata("design:type", Number)
], PaymentNotification.prototype, "fiscalYearRef", void 0);
exports.PaymentNotification = PaymentNotification = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaymentNotifications' })
], PaymentNotification);
//# sourceMappingURL=payment-notification.entity.js.map