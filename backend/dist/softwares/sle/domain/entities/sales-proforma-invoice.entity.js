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
exports.SalesProformaInvoice = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const sales_proforma_invoice_item_entity_1 = require("./sales-proforma-invoice-item.entity");
const sales_proforma_invoice_factor_entity_1 = require("./sales-proforma-invoice-factor.entity");
let SalesProformaInvoice = class SalesProformaInvoice extends app_base_entity_1.AppBaseEntity {
};
exports.SalesProformaInvoice = SalesProformaInvoice;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "SalesProformaID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "ProformaNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoice.prototype, "ProformaDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoice.prototype, "ValidityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "CustomerRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoice.prototype, "CustomerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "SalesTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "SalesCenterRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "DeliveryLocationRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "SettlementMethodRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoice.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoice.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_proforma_invoice_item_entity_1.SalesProformaInvoiceItem, (item) => item.salesProforma, { cascade: true }),
    __metadata("design:type", Array)
], SalesProformaInvoice.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_proforma_invoice_factor_entity_1.SalesProformaInvoiceFactor, (factor) => factor.salesProforma, { cascade: true }),
    __metadata("design:type", Array)
], SalesProformaInvoice.prototype, "factors", void 0);
exports.SalesProformaInvoice = SalesProformaInvoice = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesProformaInvoices' })
], SalesProformaInvoice);
//# sourceMappingURL=sales-proforma-invoice.entity.js.map