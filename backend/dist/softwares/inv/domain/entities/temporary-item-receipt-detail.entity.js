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
exports.TemporaryItemReceiptDetail = void 0;
const typeorm_1 = require("typeorm");
const temporary_item_receipt_entity_1 = require("./temporary-item-receipt.entity");
const item_entity_1 = require("./item.entity");
const temporary_item_receipt_tracking_factor_entity_1 = require("./temporary-item-receipt-tracking-factor.entity");
let TemporaryItemReceiptDetail = class TemporaryItemReceiptDetail {
};
exports.TemporaryItemReceiptDetail = TemporaryItemReceiptDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "TemporaryItemReceiptDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "TemporaryItemReceiptRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => temporary_item_receipt_entity_1.TemporaryItemReceipt, (tr) => tr.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'TemporaryItemReceiptRef' }),
    __metadata("design:type", temporary_item_receipt_entity_1.TemporaryItemReceipt)
], TemporaryItemReceiptDetail.prototype, "temporaryItemReceipt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], TemporaryItemReceiptDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], TemporaryItemReceiptDetail.prototype, "BaseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], TemporaryItemReceiptDetail.prototype, "UnitName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "UnitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], TemporaryItemReceiptDetail.prototype, "Discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], TemporaryItemReceiptDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TemporaryItemReceiptDetail.prototype, "TrackingFactorValues", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => temporary_item_receipt_tracking_factor_entity_1.TemporaryItemReceiptTrackingFactor, (tf) => tf.temporaryItemReceiptDetail, { cascade: true }),
    __metadata("design:type", Array)
], TemporaryItemReceiptDetail.prototype, "trackingFactors", void 0);
exports.TemporaryItemReceiptDetail = TemporaryItemReceiptDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'TemporaryItemReceiptDetails' })
], TemporaryItemReceiptDetail);
//# sourceMappingURL=temporary-item-receipt-detail.entity.js.map