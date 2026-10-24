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
exports.PurchaseInvoiceDetail = void 0;
const typeorm_1 = require("typeorm");
const purchase_invoice_entity_1 = require("./purchase-invoice.entity");
const item_entity_1 = require("./item.entity");
let PurchaseInvoiceDetail = class PurchaseInvoiceDetail {
};
exports.PurchaseInvoiceDetail = PurchaseInvoiceDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "PurchaseInvoiceDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "PurchaseInvoiceRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_invoice_entity_1.PurchaseInvoice, (pi) => pi.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PurchaseInvoiceRef' }),
    __metadata("design:type", purchase_invoice_entity_1.PurchaseInvoice)
], PurchaseInvoiceDetail.prototype, "purchaseInvoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], PurchaseInvoiceDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "UnitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceDetail.prototype, "Discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PurchaseInvoiceDetail.prototype, "TrackingFactorValues", void 0);
exports.PurchaseInvoiceDetail = PurchaseInvoiceDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'PurchaseInvoiceDetails' })
], PurchaseInvoiceDetail);
//# sourceMappingURL=purchase-invoice-detail.entity.js.map