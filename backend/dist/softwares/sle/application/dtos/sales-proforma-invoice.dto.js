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
exports.UpdateSalesProformaInvoiceDto = exports.CreateSalesProformaInvoiceDto = exports.SalesProformaInvoiceFactorDto = exports.SalesProformaInvoiceItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SalesProformaInvoiceItemDto {
}
exports.SalesProformaInvoiceItemDto = SalesProformaInvoiceItemDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SalesProformaInvoiceItemDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "ItemCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "ItemName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "UnitName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "TotalPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceItemDto.prototype, "trackingFactorValues", void 0);
class SalesProformaInvoiceFactorDto {
}
exports.SalesProformaInvoiceFactorDto = SalesProformaInvoiceFactorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceFactorDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceFactorDto.prototype, "FactorTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceFactorDto.prototype, "FactorType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceFactorDto.prototype, "Amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesProformaInvoiceFactorDto.prototype, "Description", void 0);
class CreateSalesProformaInvoiceDto {
}
exports.CreateSalesProformaInvoiceDto = CreateSalesProformaInvoiceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "ProformaNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "ProformaDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "ValidityDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "DeliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "CustomerRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "CustomerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "SalesTypeRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "SalesCenterRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "DeliveryLocationRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "SettlementMethodRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "Status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesProformaInvoiceDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SalesProformaInvoiceItemDto),
    __metadata("design:type", Array)
], CreateSalesProformaInvoiceDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SalesProformaInvoiceFactorDto),
    __metadata("design:type", Array)
], CreateSalesProformaInvoiceDto.prototype, "factors", void 0);
class UpdateSalesProformaInvoiceDto extends CreateSalesProformaInvoiceDto {
}
exports.UpdateSalesProformaInvoiceDto = UpdateSalesProformaInvoiceDto;
//# sourceMappingURL=sales-proforma-invoice.dto.js.map