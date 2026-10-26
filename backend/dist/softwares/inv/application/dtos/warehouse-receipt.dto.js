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
exports.PriceReceiptItemsDto = exports.PriceReceiptItemRequestDto = exports.UpdateWarehouseReceiptDto = exports.CreateWarehouseReceiptDto = exports.WarehouseReceiptFactorDto = exports.WarehouseReceiptDetailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WarehouseReceiptDetailDto {
}
exports.WarehouseReceiptDetailDto = WarehouseReceiptDetailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WarehouseReceiptDetailDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WarehouseReceiptDetailDto.prototype, "WarehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WarehouseReceiptDetailDto.prototype, "BaseNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WarehouseReceiptDetailDto.prototype, "UnitName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WarehouseReceiptDetailDto.prototype, "UnitType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "Quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "Discount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "TotalPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "PriceAfterDiscount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "Additions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "VatTax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "Deductions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptDetailDto.prototype, "NetPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WarehouseReceiptDetailDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WarehouseReceiptDetailDto.prototype, "trackingFactorValues", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WarehouseReceiptDetailDto.prototype, "TrackingFactorValues", void 0);
class WarehouseReceiptFactorDto {
}
exports.WarehouseReceiptFactorDto = WarehouseReceiptFactorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptFactorDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WarehouseReceiptFactorDto.prototype, "FactorTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WarehouseReceiptFactorDto.prototype, "FactorType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseReceiptFactorDto.prototype, "Amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WarehouseReceiptFactorDto.prototype, "Description", void 0);
class CreateWarehouseReceiptDto {
}
exports.CreateWarehouseReceiptDto = CreateWarehouseReceiptDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "BaseType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "WarehouseDocumentTypeRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "WarehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseReceiptDto.prototype, "WarehouseName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "TemporaryReceiptRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "SupplyRequestRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "PurchaseInvoiceRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "SupplierRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseReceiptDto.prototype, "SupplierName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "ReceiptNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "ReceiptDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseReceiptDto.prototype, "BaseDocumentNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "Status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWarehouseReceiptDto.prototype, "CurrencyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseReceiptDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WarehouseReceiptDetailDto),
    __metadata("design:type", Array)
], CreateWarehouseReceiptDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WarehouseReceiptFactorDto),
    __metadata("design:type", Array)
], CreateWarehouseReceiptDto.prototype, "factors", void 0);
class UpdateWarehouseReceiptDto extends CreateWarehouseReceiptDto {
}
exports.UpdateWarehouseReceiptDto = UpdateWarehouseReceiptDto;
class PriceReceiptItemRequestDto {
}
exports.PriceReceiptItemRequestDto = PriceReceiptItemRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PriceReceiptItemRequestDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PriceReceiptItemRequestDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PriceReceiptItemRequestDto.prototype, "ItemCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PriceReceiptItemRequestDto.prototype, "ItemName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PriceReceiptItemRequestDto.prototype, "Quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PriceReceiptItemRequestDto.prototype, "UnitPrice", void 0);
class PriceReceiptItemsDto {
}
exports.PriceReceiptItemsDto = PriceReceiptItemsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PriceReceiptItemsDto.prototype, "pricingMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PriceReceiptItemsDto.prototype, "ReceiptDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PriceReceiptItemsDto.prototype, "WarehouseReceiptID", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PriceReceiptItemRequestDto),
    __metadata("design:type", Array)
], PriceReceiptItemsDto.prototype, "items", void 0);
//# sourceMappingURL=warehouse-receipt.dto.js.map