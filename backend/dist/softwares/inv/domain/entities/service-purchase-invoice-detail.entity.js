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
exports.ServicePurchaseInvoiceDetail = void 0;
const typeorm_1 = require("typeorm");
const service_purchase_invoice_entity_1 = require("./service-purchase-invoice.entity");
const item_entity_1 = require("./item.entity");
let ServicePurchaseInvoiceDetail = class ServicePurchaseInvoiceDetail {
};
exports.ServicePurchaseInvoiceDetail = ServicePurchaseInvoiceDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "ServicePurchaseInvoiceDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "ServicePurchaseInvoiceRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_purchase_invoice_entity_1.ServicePurchaseInvoice, (spi) => spi.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ServicePurchaseInvoiceRef' }),
    __metadata("design:type", service_purchase_invoice_entity_1.ServicePurchaseInvoice)
], ServicePurchaseInvoiceDetail.prototype, "servicePurchaseInvoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], ServicePurchaseInvoiceDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "UnitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceDetail.prototype, "Discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ServicePurchaseInvoiceDetail.prototype, "Description", void 0);
exports.ServicePurchaseInvoiceDetail = ServicePurchaseInvoiceDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ServicePurchaseInvoiceDetails' })
], ServicePurchaseInvoiceDetail);
//# sourceMappingURL=service-purchase-invoice-detail.entity.js.map