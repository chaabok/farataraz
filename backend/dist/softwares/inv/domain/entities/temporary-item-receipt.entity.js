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
exports.TemporaryItemReceipt = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const temporary_item_receipt_detail_entity_1 = require("./temporary-item-receipt-detail.entity");
const temporary_item_receipt_factor_entity_1 = require("./temporary-item-receipt-factor.entity");
let TemporaryItemReceipt = class TemporaryItemReceipt extends app_base_entity_1.AppBaseEntity {
};
exports.TemporaryItemReceipt = TemporaryItemReceipt;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "TemporaryItemReceiptID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "Type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "BaseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "SupplyRequestRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "SupplierRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], TemporaryItemReceipt.prototype, "SupplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "ReceiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TemporaryItemReceipt.prototype, "ReceiptDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], TemporaryItemReceipt.prototype, "BaseDocumentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "CurrencyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], TemporaryItemReceipt.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], TemporaryItemReceipt.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => temporary_item_receipt_detail_entity_1.TemporaryItemReceiptDetail, (detail) => detail.temporaryItemReceipt, { cascade: true }),
    __metadata("design:type", Array)
], TemporaryItemReceipt.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => temporary_item_receipt_factor_entity_1.TemporaryItemReceiptFactor, (factor) => factor.temporaryItemReceipt, { cascade: true }),
    __metadata("design:type", Array)
], TemporaryItemReceipt.prototype, "factors", void 0);
exports.TemporaryItemReceipt = TemporaryItemReceipt = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'TemporaryItemReceipts' })
], TemporaryItemReceipt);
//# sourceMappingURL=temporary-item-receipt.entity.js.map