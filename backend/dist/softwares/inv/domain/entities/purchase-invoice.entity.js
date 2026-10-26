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
exports.PurchaseInvoice = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const purchase_invoice_detail_entity_1 = require("./purchase-invoice-detail.entity");
const purchase_invoice_factor_entity_1 = require("./purchase-invoice-factor.entity");
let PurchaseInvoice = class PurchaseInvoice extends app_base_entity_1.AppBaseEntity {
};
exports.PurchaseInvoice = PurchaseInvoice;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "PurchaseInvoiceID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "BaseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "SupplyRequestRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "SupplierRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoice.prototype, "SupplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "InvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PurchaseInvoice.prototype, "InvoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoice.prototype, "BaseDocumentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "CurrencyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoice.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], PurchaseInvoice.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => purchase_invoice_detail_entity_1.PurchaseInvoiceDetail, (detail) => detail.purchaseInvoice, { cascade: true }),
    __metadata("design:type", Array)
], PurchaseInvoice.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => purchase_invoice_factor_entity_1.PurchaseInvoiceFactor, (factor) => factor.purchaseInvoice, { cascade: true }),
    __metadata("design:type", Array)
], PurchaseInvoice.prototype, "factors", void 0);
exports.PurchaseInvoice = PurchaseInvoice = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'PurchaseInvoices' })
], PurchaseInvoice);
//# sourceMappingURL=purchase-invoice.entity.js.map