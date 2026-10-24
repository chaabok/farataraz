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
exports.ServicePurchaseInvoice = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const service_purchase_invoice_detail_entity_1 = require("./service-purchase-invoice-detail.entity");
const service_purchase_invoice_factor_entity_1 = require("./service-purchase-invoice-factor.entity");
let ServicePurchaseInvoice = class ServicePurchaseInvoice extends app_base_entity_1.AppBaseEntity {
};
exports.ServicePurchaseInvoice = ServicePurchaseInvoice;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "ServicePurchaseInvoiceID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "BaseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "SupplyRequestRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "SupplierRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ServicePurchaseInvoice.prototype, "SupplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "InvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], ServicePurchaseInvoice.prototype, "InvoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ServicePurchaseInvoice.prototype, "BaseDocumentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "CurrencyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], ServicePurchaseInvoice.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServicePurchaseInvoice.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_purchase_invoice_detail_entity_1.ServicePurchaseInvoiceDetail, (detail) => detail.servicePurchaseInvoice, { cascade: true }),
    __metadata("design:type", Array)
], ServicePurchaseInvoice.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_purchase_invoice_factor_entity_1.ServicePurchaseInvoiceFactor, (factor) => factor.servicePurchaseInvoice, { cascade: true }),
    __metadata("design:type", Array)
], ServicePurchaseInvoice.prototype, "factors", void 0);
exports.ServicePurchaseInvoice = ServicePurchaseInvoice = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ServicePurchaseInvoices' })
], ServicePurchaseInvoice);
//# sourceMappingURL=service-purchase-invoice.entity.js.map