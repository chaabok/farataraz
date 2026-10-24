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
exports.ReceiptReturnedPaymentPromissoryNote = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const receipt_notification_entity_1 = require("./receipt-notification.entity");
const payment_promissory_note_entity_1 = require("./payment-promissory-note.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./reciept-and-payment-accounting-setting.entity");
let ReceiptReturnedPaymentPromissoryNote = class ReceiptReturnedPaymentPromissoryNote extends app_base_entity_1.AppBaseEntity {
};
exports.ReceiptReturnedPaymentPromissoryNote = ReceiptReturnedPaymentPromissoryNote;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReceiptReturnedPaymentPromissoryNoteID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNote.prototype, "receiptReturnedPaymentPromissoryNoteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReceiptNotificationRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNote.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => receipt_notification_entity_1.ReceiptNotification, rn => rn.returnedPaymentPromissoryNotes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ReceiptNotificationRef', referencedColumnName: 'receiptNotificationId' }),
    __metadata("design:type", receipt_notification_entity_1.ReceiptNotification)
], ReceiptReturnedPaymentPromissoryNote.prototype, "receiptNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentPromissoryNoteRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNote.prototype, "paymentPromissoryNoteRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_promissory_note_entity_1.PaymentPromissoryNote, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'PaymentPromissoryNoteRef', referencedColumnName: 'paymentPromissoryNoteId' }),
    __metadata("design:type", payment_promissory_note_entity_1.PaymentPromissoryNote)
], ReceiptReturnedPaymentPromissoryNote.prototype, "paymentPromissoryNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountingSettingRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNote.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountingSettingRef', referencedColumnName: 'recieptAndPaymentAccountingSettingId' }),
    __metadata("design:type", reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)
], ReceiptReturnedPaymentPromissoryNote.prototype, "accountingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNote.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], ReceiptReturnedPaymentPromissoryNote.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value ? parseFloat(value) : 0
        } }),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNote.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReceiptReturnedPaymentPromissoryNote.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicDetailedData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ReceiptReturnedPaymentPromissoryNote.prototype, "dynamicDetailedData", void 0);
exports.ReceiptReturnedPaymentPromissoryNote = ReceiptReturnedPaymentPromissoryNote = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ReceiptReturnedPaymentPromissoryNote' })
], ReceiptReturnedPaymentPromissoryNote);
//# sourceMappingURL=receipt-returned-payment-promissory-note.entity.js.map