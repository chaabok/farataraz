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
exports.SalesDocumentSettings = void 0;
const typeorm_1 = require("typeorm");
let SalesDocumentSettings = class SalesDocumentSettings {
};
exports.SalesDocumentSettings = SalesDocumentSettings;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "SalesDocumentSettingsID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "SalesDocumentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "HasBaseDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesDocumentSettings.prototype, "BaseDocumentTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "ShowWarehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "DefaultWarehouseRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "ShowSalesCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "DefaultSalesCenterRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "ShowSalesType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "DefaultSalesTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "ShowDeliveryLocations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "DefaultDeliveryLocationRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "ShowSettlementMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "DefaultSettlementMethodRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "HasAccountingDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "ShowPurchaseSalesParameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SalesDocumentSettings.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "BusinessStructureRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "CompanyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "CreatorRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SalesDocumentSettings.prototype, "CreationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesDocumentSettings.prototype, "LastModifierRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SalesDocumentSettings.prototype, "LastModificationDate", void 0);
exports.SalesDocumentSettings = SalesDocumentSettings = __decorate([
    (0, typeorm_1.Entity)({ name: 'SalesDocumentSettings', schema: 'Sle' }),
    (0, typeorm_1.Index)('UQ_SalesDocumentSettings_Type_BS', ['SalesDocumentType', 'BusinessStructureRef'], { unique: true })
], SalesDocumentSettings);
//# sourceMappingURL=sales-document-settings.entity.js.map