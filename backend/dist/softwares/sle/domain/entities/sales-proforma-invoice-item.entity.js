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
exports.SalesProformaInvoiceItem = void 0;
const typeorm_1 = require("typeorm");
const sales_proforma_invoice_entity_1 = require("./sales-proforma-invoice.entity");
let SalesProformaInvoiceItem = class SalesProformaInvoiceItem {
};
exports.SalesProformaInvoiceItem = SalesProformaInvoiceItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "SalesProformaInvoiceItemID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "SalesProformaRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoiceItem.prototype, "ItemCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoiceItem.prototype, "ItemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoiceItem.prototype, "UnitName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesProformaInvoiceItem.prototype, "TotalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesProformaInvoiceItem.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SalesProformaInvoiceItem.prototype, "TrackingFactorValues", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_proforma_invoice_entity_1.SalesProformaInvoice, (proforma) => proforma.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'SalesProformaRef' }),
    __metadata("design:type", sales_proforma_invoice_entity_1.SalesProformaInvoice)
], SalesProformaInvoiceItem.prototype, "salesProforma", void 0);
exports.SalesProformaInvoiceItem = SalesProformaInvoiceItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesProformaInvoiceItems' })
], SalesProformaInvoiceItem);
//# sourceMappingURL=sales-proforma-invoice-item.entity.js.map