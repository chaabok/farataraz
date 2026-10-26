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
exports.ServicePurchaseInvoiceFactor = void 0;
const typeorm_1 = require("typeorm");
const service_purchase_invoice_entity_1 = require("./service-purchase-invoice.entity");
let ServicePurchaseInvoiceFactor = class ServicePurchaseInvoiceFactor {
};
exports.ServicePurchaseInvoiceFactor = ServicePurchaseInvoiceFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceFactor.prototype, "ServicePurchaseInvoiceFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceFactor.prototype, "ServicePurchaseInvoiceRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_purchase_invoice_entity_1.ServicePurchaseInvoice, (spi) => spi.factors, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ServicePurchaseInvoiceRef' }),
    __metadata("design:type", service_purchase_invoice_entity_1.ServicePurchaseInvoice)
], ServicePurchaseInvoiceFactor.prototype, "servicePurchaseInvoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceFactor.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ServicePurchaseInvoiceFactor.prototype, "FactorTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceFactor.prototype, "FactorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoiceFactor.prototype, "Amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ServicePurchaseInvoiceFactor.prototype, "Description", void 0);
exports.ServicePurchaseInvoiceFactor = ServicePurchaseInvoiceFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ServicePurchaseInvoiceFactors' })
], ServicePurchaseInvoiceFactor);
//# sourceMappingURL=service-purchase-invoice-factor.entity.js.map