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
exports.VoucherItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const voucher_entity_1 = require("./voucher.entity");
let VoucherItem = class VoucherItem extends app_base_entity_1.AppBaseEntity {
};
exports.VoucherItem = VoucherItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'VoucherItemID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "voucherItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherID', type: 'bigint' }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "voucherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_entity_1.Voucher, voucher => voucher.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'VoucherID' }),
    __metadata("design:type", voucher_entity_1.Voucher)
], VoucherItem.prototype, "voucher", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RowNumber', type: 'integer' }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "rowNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountID', type: 'bigint' }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID1', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID2', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID3', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId3", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID4', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId4", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID5', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId5", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID6', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId6", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID7', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId7", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID8', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId8", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID9', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId9", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID10', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "detailedAccountId10", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Debit', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "debit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Credit', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "credit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], VoucherItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "currencyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyAmount', type: 'decimal', precision: 18, scale: 4, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "currencyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ExchangeRate', type: 'decimal', precision: 18, scale: 6, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], VoucherItem.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TrackingNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], VoucherItem.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TrackingDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], VoucherItem.prototype, "trackingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsSystemGenerated', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], VoucherItem.prototype, "isSystemGenerated", void 0);
exports.VoucherItem = VoucherItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'VoucherItem' })
], VoucherItem);
//# sourceMappingURL=voucher-item.entity.js.map