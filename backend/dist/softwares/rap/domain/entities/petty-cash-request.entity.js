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
exports.PettyCashRequest = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const petty_cash_entity_1 = require("./petty-cash.entity");
const petty_cash_summary_entity_1 = require("./petty-cash-summary.entity");
let PettyCashRequest = class PettyCashRequest extends app_base_entity_1.AppBaseEntity {
};
exports.PettyCashRequest = PettyCashRequest;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PettyCashRequestID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "pettyCashRequestId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'PettyCashRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "pettyCashRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => petty_cash_entity_1.PettyCash),
    (0, typeorm_1.JoinColumn)({ name: 'PettyCashRef', referencedColumnName: 'pettyCashId' }),
    __metadata("design:type", petty_cash_entity_1.PettyCash)
], PettyCashRequest.prototype, "pettyCash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RequestNumber', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], PettyCashRequest.prototype, "requestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RequestDate', type: 'date', nullable: false }),
    __metadata("design:type", Date)
], PettyCashRequest.prototype, "requestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Basis', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "basis", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'PettyCashSummaryRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "pettyCashSummaryRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => petty_cash_summary_entity_1.PettyCashSummary),
    (0, typeorm_1.JoinColumn)({ name: 'PettyCashSummaryRef', referencedColumnName: 'pettyCashSummaryId' }),
    __metadata("design:type", petty_cash_summary_entity_1.PettyCashSummary)
], PettyCashRequest.prototype, "pettyCashSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'int', default: 2 }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RequestedAmount', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "requestedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], PettyCashRequest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FiscalYearRef', type: 'bigint', nullable: false, default: 1, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCashRequest.prototype, "fiscalYearRef", void 0);
exports.PettyCashRequest = PettyCashRequest = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PettyCashRequests' })
], PettyCashRequest);
//# sourceMappingURL=petty-cash-request.entity.js.map