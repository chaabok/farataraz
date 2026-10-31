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
exports.WarehouseReceipt = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const warehouse_receipt_detail_entity_1 = require("./warehouse-receipt-detail.entity");
const warehouse_receipt_factor_entity_1 = require("./warehouse-receipt-factor.entity");
let WarehouseReceipt = class WarehouseReceipt extends app_base_entity_1.AppBaseEntity {
};
exports.WarehouseReceipt = WarehouseReceipt;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "WarehouseReceiptID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "BaseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "WarehouseDocumentTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceipt.prototype, "WarehouseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "TemporaryReceiptRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "SupplyRequestRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "PurchaseInvoiceRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "SalesInvoiceRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "SupplierRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceipt.prototype, "SupplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "ReceiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], WarehouseReceipt.prototype, "ReceiptDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceipt.prototype, "BaseDocumentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "CurrencyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], WarehouseReceipt.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseReceipt.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => warehouse_receipt_detail_entity_1.WarehouseReceiptDetail, (detail) => detail.warehouseReceipt, { cascade: true }),
    __metadata("design:type", Array)
], WarehouseReceipt.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => warehouse_receipt_factor_entity_1.WarehouseReceiptFactor, (factor) => factor.warehouseReceipt, { cascade: true }),
    __metadata("design:type", Array)
], WarehouseReceipt.prototype, "factors", void 0);
exports.WarehouseReceipt = WarehouseReceipt = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseVouchers' })
], WarehouseReceipt);
//# sourceMappingURL=warehouse-receipt.entity.js.map