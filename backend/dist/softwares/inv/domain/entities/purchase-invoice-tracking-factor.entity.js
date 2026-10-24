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
exports.PurchaseInvoiceTrackingFactor = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const purchase_invoice_detail_entity_1 = require("./purchase-invoice-detail.entity");
let PurchaseInvoiceTrackingFactor = class PurchaseInvoiceTrackingFactor extends app_base_entity_1.AppBaseEntity {
};
exports.PurchaseInvoiceTrackingFactor = PurchaseInvoiceTrackingFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PurchaseInvoiceTrackingFactor.prototype, "PurchaseInvoiceTrackingFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PurchaseInvoiceTrackingFactor.prototype, "PurchaseInvoiceDetailRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], PurchaseInvoiceTrackingFactor.prototype, "TrackingFactorRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PurchaseInvoiceTrackingFactor.prototype, "TrackingFactorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceTrackingFactor.prototype, "TrackingFactorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], PurchaseInvoiceTrackingFactor.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceTrackingFactor.prototype, "FactorValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceTrackingFactor.prototype, "StartValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PurchaseInvoiceTrackingFactor.prototype, "EndValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PurchaseInvoiceTrackingFactor.prototype, "TrackingFactorValues", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_invoice_detail_entity_1.PurchaseInvoiceDetail, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PurchaseInvoiceDetailRef' }),
    __metadata("design:type", purchase_invoice_detail_entity_1.PurchaseInvoiceDetail)
], PurchaseInvoiceTrackingFactor.prototype, "purchaseInvoiceDetail", void 0);
exports.PurchaseInvoiceTrackingFactor = PurchaseInvoiceTrackingFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'PurchaseInvoiceTrackingFactors' })
], PurchaseInvoiceTrackingFactor);
//# sourceMappingURL=purchase-invoice-tracking-factor.entity.js.map