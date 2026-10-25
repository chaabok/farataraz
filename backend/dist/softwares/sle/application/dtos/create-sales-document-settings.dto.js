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
exports.UpdateSalesDocumentSettingsDto = exports.CreateSalesDocumentSettingsDto = void 0;
exports.assertValidSalesDocumentType = assertValidSalesDocumentType;
const class_validator_1 = require("class-validator");
const sales_document_type_enum_1 = require("../../domain/entities/sales-document-type.enum");
class CreateSalesDocumentSettingsDto {
}
exports.CreateSalesDocumentSettingsDto = CreateSalesDocumentSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "SalesDocumentSettingsID", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'نوع سند فروش الزامی است' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'نوع سند فروش نمی‌تواند خالی باشد' }),
    (0, class_validator_1.Min)(1, { message: 'نوع سند فروش نامعتبر است' }),
    (0, class_validator_1.Max)(7, { message: 'نوع سند فروش نامعتبر است' }),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "SalesDocumentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "HasBaseDocument", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesDocumentSettingsDto.prototype, "BaseDocumentTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "ShowWarehouse", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "DefaultWarehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "ShowSalesCenter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "DefaultSalesCenterRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "ShowSalesType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "DefaultSalesTypeRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "ShowDeliveryLocations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "DefaultDeliveryLocationRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "ShowSettlementMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSalesDocumentSettingsDto.prototype, "DefaultSettlementMethodRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "HasAccountingDocument", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "ShowPurchaseSalesParameters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSalesDocumentSettingsDto.prototype, "IsActive", void 0);
class UpdateSalesDocumentSettingsDto extends CreateSalesDocumentSettingsDto {
}
exports.UpdateSalesDocumentSettingsDto = UpdateSalesDocumentSettingsDto;
function assertValidSalesDocumentType(dto) {
    if (!(0, sales_document_type_enum_1.isValidSalesDocumentType)(dto.SalesDocumentType)) {
        throw new Error('نوع سند فروش نامعتبر است. باید یکی از انواع تعریف‌شده باشد.');
    }
}
//# sourceMappingURL=create-sales-document-settings.dto.js.map