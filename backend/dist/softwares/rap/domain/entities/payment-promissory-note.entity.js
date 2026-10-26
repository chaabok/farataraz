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
exports.PaymentPromissoryNote = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const payment_notification_entity_1 = require("./payment-notification.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./reciept-and-payment-accounting-setting.entity");
const promissory_note_item_entity_1 = require("./promissory-note-item.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
let PaymentPromissoryNote = class PaymentPromissoryNote extends app_base_entity_1.AppBaseEntity {
};
exports.PaymentPromissoryNote = PaymentPromissoryNote;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaymentPromissoryNoteID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "paymentPromissoryNoteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentNotificationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "paymentNotificationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_notification_entity_1.PaymentNotification, pn => pn.promissoryNoteItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PaymentNotificationRef', referencedColumnName: 'paymentNotificationId' }),
    __metadata("design:type", payment_notification_entity_1.PaymentNotification)
], PaymentPromissoryNote.prototype, "paymentNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' }),
    __metadata("design:type", reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)
], PaymentPromissoryNote.prototype, "accountingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], PaymentPromissoryNote.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PromissoryNoteItemRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "promissoryNoteItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => promissory_note_item_entity_1.PromissoryNoteItem, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'PromissoryNoteItemRef', referencedColumnName: 'promissoryNoteItemId' }),
    __metadata("design:type", promissory_note_item_entity_1.PromissoryNoteItem)
], PaymentPromissoryNote.prototype, "promissoryNoteItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : 0
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "currencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CurrencyRef', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], PaymentPromissoryNote.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EquivalentAmount', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], PaymentPromissoryNote.prototype, "equivalentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DueDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PaymentPromissoryNote.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentPromissoryNote.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentPromissoryNote.prototype, "dynamicDetailedData", void 0);
exports.PaymentPromissoryNote = PaymentPromissoryNote = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaymentPromissoryNote' })
], PaymentPromissoryNote);
//# sourceMappingURL=payment-promissory-note.entity.js.map