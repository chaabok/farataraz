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
exports.UpdateSalesReturnPermissionDto = exports.CreateSalesReturnPermissionDto = exports.SalesReturnPermissionFactorDto = exports.SalesReturnPermissionItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SalesReturnPermissionItemDto {
}
exports.SalesReturnPermissionItemDto = SalesReturnPermissionItemDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SalesReturnPermissionItemDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "ItemCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "ItemName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "UnitName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "TotalPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionItemDto.prototype, "trackingFactorValues", void 0);
class SalesReturnPermissionFactorDto {
}
exports.SalesReturnPermissionFactorDto = SalesReturnPermissionFactorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionFactorDto.prototype, "RowNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionFactorDto.prototype, "FactorTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionFactorDto.prototype, "FactorType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionFactorDto.prototype, "Amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SalesReturnPermissionFactorDto.prototype, "Description", void 0);
class CreateSalesReturnPermissionDto {
}
exports.CreateSalesReturnPermissionDto = CreateSalesReturnPermissionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "PermissionNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "PermissionDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "CustomerRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "CustomerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "SalesTypeRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "SalesCenterRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "DeliveryLocationRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "SettlementMethodRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "Status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "BaseDocumentTypeRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSalesReturnPermissionDto.prototype, "BaseDocumentRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SalesReturnPermissionItemDto),
    __metadata("design:type", Array)
], CreateSalesReturnPermissionDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SalesReturnPermissionFactorDto),
    __metadata("design:type", Array)
], CreateSalesReturnPermissionDto.prototype, "factors", void 0);
class UpdateSalesReturnPermissionDto extends CreateSalesReturnPermissionDto {
}
exports.UpdateSalesReturnPermissionDto = UpdateSalesReturnPermissionDto;
//# sourceMappingURL=sales-return-permission.dto.js.map