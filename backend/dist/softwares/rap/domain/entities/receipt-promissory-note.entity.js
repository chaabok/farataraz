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
exports.ReceiptPromissoryNote = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const receipt_notification_entity_1 = require("./receipt-notification.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./reciept-and-payment-accounting-setting.entity");
const cash_entity_1 = require("./cash.entity");
let ReceiptPromissoryNote = class ReceiptPromissoryNote extends app_base_entity_1.AppBaseEntity {
};
exports.ReceiptPromissoryNote = ReceiptPromissoryNote;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceiptPromissoryNoteID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "receiptPromissoryNoteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReceiptNotificationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => receipt_notification_entity_1.ReceiptNotification, pn => pn.promissoryNoteItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ReceiptNotificationRef', referencedColumnName: 'receiptNotificationId' }),
    __metadata("design:type", receipt_notification_entity_1.ReceiptNotification)
], ReceiptPromissoryNote.prototype, "receiptNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' }),
    __metadata("design:type", reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)
], ReceiptPromissoryNote.prototype, "accountingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CashRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "cashRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cash_entity_1.Cash, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CashRef', referencedColumnName: 'cashId' }),
    __metadata("design:type", cash_entity_1.Cash)
], ReceiptPromissoryNote.prototype, "cash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], ReceiptPromissoryNote.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : 0
        } }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PromissoryNoteNumber', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], ReceiptPromissoryNote.prototype, "promissoryNoteNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PromissoryNoteValue', type: 'numeric', precision: 18, scale: 4, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], ReceiptPromissoryNote.prototype, "promissoryNoteValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReceiptPromissoryNote.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ReceiptPromissoryNote.prototype, "dynamicDetailedData", void 0);
exports.ReceiptPromissoryNote = ReceiptPromissoryNote = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceiptPromissoryNote' })
], ReceiptPromissoryNote);
//# sourceMappingURL=receipt-promissory-note.entity.js.map