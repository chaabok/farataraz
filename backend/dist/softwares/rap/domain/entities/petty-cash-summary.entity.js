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
exports.PettyCashSummary = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const petty_cash_entity_1 = require("./petty-cash.entity");
const petty_cash_summary_enum_1 = require("./petty-cash-summary.enum");
const petty_cash_summary_item_entity_1 = require("./petty-cash-summary-item.entity");
const voucher_entity_1 = require("../../../accounting/domain/entities/voucher.entity");
let PettyCashSummary = class PettyCashSummary extends app_base_entity_1.AppBaseEntity {
};
exports.PettyCashSummary = PettyCashSummary;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PettyCashSummary.prototype, "pettyCashSummaryId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'PettyCashRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCashSummary.prototype, "pettyCashRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => petty_cash_entity_1.PettyCash),
    (0, typeorm_1.JoinColumn)({ name: 'PettyCashRef', referencedColumnName: 'pettyCashId' }),
    __metadata("design:type", petty_cash_entity_1.PettyCash)
], PettyCashSummary.prototype, "pettyCash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Number', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCashSummary.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Date', type: 'date', nullable: false }),
    __metadata("design:type", Date)
], PettyCashSummary.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], PettyCashSummary.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCashSummary.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'State', type: 'int', default: petty_cash_summary_enum_1.PettyCashSummaryState.DRAFT }),
    __metadata("design:type", Number)
], PettyCashSummary.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'VoucherHeaderRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PettyCashSummary.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_entity_1.Voucher, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'VoucherHeaderRef', referencedColumnName: 'voucherId' }),
    __metadata("design:type", voucher_entity_1.Voucher)
], PettyCashSummary.prototype, "voucherHeader", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => petty_cash_summary_item_entity_1.PettyCashSummaryItem, item => item.pettyCashSummary, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], PettyCashSummary.prototype, "items", void 0);
exports.PettyCashSummary = PettyCashSummary = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PettyCashSummaries' })
], PettyCashSummary);
//# sourceMappingURL=petty-cash-summary.entity.js.map