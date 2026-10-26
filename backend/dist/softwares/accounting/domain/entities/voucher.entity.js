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
exports.Voucher = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const voucher_item_entity_1 = require("./voucher-item.entity");
let Voucher = class Voucher extends app_base_entity_1.AppBaseEntity {
};
exports.Voucher = Voucher;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'VoucherID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], Voucher.prototype, "voucherId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'VoucherTypeID',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], Voucher.prototype, "voucherTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherNumber', type: 'integer' }),
    __metadata("design:type", Number)
], Voucher.prototype, "voucherNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherDate', type: 'date' }),
    __metadata("design:type", Date)
], Voucher.prototype, "voucherDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Voucher.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReferenceNumber', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Voucher.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SubNumber', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Voucher.prototype, "subNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherNature', type: 'varchar', length: 100, default: 'عادی', nullable: true }),
    __metadata("design:type", String)
], Voucher.prototype, "voucherNature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description2', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Voucher.prototype, "description2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SourceDocDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Voucher.prototype, "sourceDocDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DailyNumber', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Voucher.prototype, "dailyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TotalDebit', type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Voucher.prototype, "totalDebit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TotalCredit', type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Voucher.prototype, "totalCredit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'smallint', default: 2 }),
    __metadata("design:type", Number)
], Voucher.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PreviousStatus', type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], Voucher.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'FiscalYearRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], Voucher.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => voucher_item_entity_1.VoucherItem, item => item.voucher, { cascade: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Voucher.prototype, "items", void 0);
exports.Voucher = Voucher = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'Voucher' })
], Voucher);
//# sourceMappingURL=voucher.entity.js.map