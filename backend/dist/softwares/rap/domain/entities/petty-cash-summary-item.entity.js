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
exports.PettyCashSummaryItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const petty_cash_summary_entity_1 = require("./petty-cash-summary.entity");
const rap_reason_entity_1 = require("./rap-reason.entity");
let PettyCashSummaryItem = class PettyCashSummaryItem extends app_base_entity_1.AppBaseEntity {
};
exports.PettyCashSummaryItem = PettyCashSummaryItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PettyCashSummaryItem.prototype, "pettyCashSummaryItemId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'PettyCashSummaryRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCashSummaryItem.prototype, "pettyCashSummaryRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => petty_cash_summary_entity_1.PettyCashSummary, summary => summary.items, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PettyCashSummaryRef', referencedColumnName: 'pettyCashSummaryId' }),
    __metadata("design:type", petty_cash_summary_entity_1.PettyCashSummary)
], PettyCashSummaryItem.prototype, "pettyCashSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReasonRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PettyCashSummaryItem.prototype, "reasonRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rap_reason_entity_1.RapReason, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ReasonRef', referencedColumnName: 'RapReasonID' }),
    __metadata("design:type", rap_reason_entity_1.RapReason)
], PettyCashSummaryItem.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentReceiptNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PettyCashSummaryItem.prototype, "paymentReceiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentReceiptDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PettyCashSummaryItem.prototype, "paymentReceiptDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], PettyCashSummaryItem.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PettyCashSummaryItem.prototype, "description", void 0);
exports.PettyCashSummaryItem = PettyCashSummaryItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PettyCashSummaryItems' })
], PettyCashSummaryItem);
//# sourceMappingURL=petty-cash-summary-item.entity.js.map