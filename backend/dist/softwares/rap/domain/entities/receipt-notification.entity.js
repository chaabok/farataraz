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
exports.ReceiptNotification = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
const voucher_entity_1 = require("../../../accounting/domain/entities/voucher.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const receipt_cash_entity_1 = require("./receipt-cash.entity");
const receipt_cheque_entity_1 = require("./receipt-cheque.entity");
const receipt_deposit_entity_1 = require("./receipt-deposit.entity");
const receipt_returned_paid_cheque_entity_1 = require("./receipt-returned-paid-cheque.entity");
const receipt_promissory_note_entity_1 = require("./receipt-promissory-note.entity");
const receipt_returned_payment_assignment_entity_1 = require("./receipt-returned-payment-assignment.entity");
const receipt_returned_payment_promissory_note_entity_1 = require("./receipt-returned-payment-promissory-note.entity");
const receipt_guarantee_entity_1 = require("./receipt-guarantee.entity");
let ReceiptNotification = class ReceiptNotification extends app_base_entity_1.AppBaseEntity {
};
exports.ReceiptNotification = ReceiptNotification;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceiptNotificationID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "receiptNotificationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseType', type: 'varchar', length: 100, nullable: false, default: 'بدون مبنا' }),
    __metadata("design:type", String)
], ReceiptNotification.prototype, "baseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReceiptNotification.prototype, "baseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReceiptType', type: 'varchar', length: 100, nullable: false, default: 'تسویه تعهدات' }),
    __metadata("design:type", String)
], ReceiptNotification.prototype, "receiptType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentNumber', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], ReceiptNotification.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentDate', type: 'date', nullable: false }),
    __metadata("design:type", Date)
], ReceiptNotification.prototype, "documentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PartyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "partyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'PartyRef', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], ReceiptNotification.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "currencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CurrencyRef', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], ReceiptNotification.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_entity_1.Voucher, { eager: false, nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' }),
    __metadata("design:type", voucher_entity_1.Voucher)
], ReceiptNotification.prototype, "voucherHeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ExchangeRate', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], ReceiptNotification.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReceiptNotification.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_cash_entity_1.ReceiptCash, cash => cash.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "cashItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_cheque_entity_1.ReceiptCheque, cheque => cheque.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "chequeItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_deposit_entity_1.ReceiptDeposit, withdrawal => withdrawal.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "depositItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_returned_paid_cheque_entity_1.ReceiptReturnedPaidCheque, returnedCheque => returnedCheque.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "returnedPaidCheques", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_promissory_note_entity_1.ReceiptPromissoryNote, rp => rp.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "promissoryNoteItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_guarantee_entity_1.ReceiptGuarantee, rg => rg.receiptNotification, { cascade: ["insert", "update", "remove"] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "guaranteeItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_returned_payment_assignment_entity_1.ReceiptReturnedPaymentAssignment, rrpa => rrpa.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "returnedPaymentAssignments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_returned_payment_promissory_note_entity_1.ReceiptReturnedPaymentPromissoryNote, rrppn => rrppn.receiptNotification, { cascade: ['insert', 'update', 'remove'] }),
    __metadata("design:type", Array)
], ReceiptNotification.prototype, "returnedPaymentPromissoryNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1 }),
    __metadata("design:type", Number)
], ReceiptNotification.prototype, "fiscalYearRef", void 0);
exports.ReceiptNotification = ReceiptNotification = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceiptNotifications' })
], ReceiptNotification);
//# sourceMappingURL=receipt-notification.entity.js.map