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
exports.WarehouseReceiptDetail = void 0;
const typeorm_1 = require("typeorm");
const warehouse_receipt_entity_1 = require("./warehouse-receipt.entity");
const item_entity_1 = require("./item.entity");
let WarehouseReceiptDetail = class WarehouseReceiptDetail {
};
exports.WarehouseReceiptDetail = WarehouseReceiptDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "WarehouseReceiptDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "WarehouseReceiptRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_receipt_entity_1.WarehouseReceipt, (wr) => wr.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseReceiptRef' }),
    __metadata("design:type", warehouse_receipt_entity_1.WarehouseReceipt)
], WarehouseReceiptDetail.prototype, "warehouseReceipt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], WarehouseReceiptDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceiptDetail.prototype, "BaseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceiptDetail.prototype, "UnitName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "UnitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "Discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseReceiptDetail.prototype, "TotalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceiptDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WarehouseReceiptDetail.prototype, "TrackingFactorValues", void 0);
exports.WarehouseReceiptDetail = WarehouseReceiptDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseVouchersDetails' })
], WarehouseReceiptDetail);
//# sourceMappingURL=warehouse-receipt-detail.entity.js.map