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
exports.PaidDocumentClearing = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const paid_document_clearing_item_entity_1 = require("./paid-document-clearing-item.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const voucher_entity_1 = require("../../../accounting/domain/entities/voucher.entity");
let PaidDocumentClearing = class PaidDocumentClearing extends app_base_entity_1.AppBaseEntity {
};
exports.PaidDocumentClearing = PaidDocumentClearing;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaidDocumentClearingID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaidDocumentClearing.prototype, "paidDocumentClearingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Number', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], PaidDocumentClearing.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Date', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], PaidDocumentClearing.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaidDocumentClearing.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'int', default: 2 }),
    __metadata("design:type", Number)
], PaidDocumentClearing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FiscalYearRef', type: 'bigint', nullable: false }),
    __metadata("design:type", Number)
], PaidDocumentClearing.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankAccountRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaidDocumentClearing.prototype, "bankAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], PaidDocumentClearing.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaidDocumentClearing.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_entity_1.Voucher, { eager: false, nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' }),
    __metadata("design:type", voucher_entity_1.Voucher)
], PaidDocumentClearing.prototype, "voucherHeader", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => paid_document_clearing_item_entity_1.PaidDocumentClearingItem, item => item.paidDocumentClearing, { cascade: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], PaidDocumentClearing.prototype, "items", void 0);
exports.PaidDocumentClearing = PaidDocumentClearing = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaidDocumentClearing' })
], PaidDocumentClearing);
//# sourceMappingURL=paid-document-clearing.entity.js.map