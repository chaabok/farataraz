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
exports.UpdateStocktakingTagHeaderDto = exports.CreateStocktakingTagHeaderDto = exports.StocktakingTagDetailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class StocktakingTagDetailDto {
}
exports.StocktakingTagDetailDto = StocktakingTagDetailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StocktakingTagDetailDto.prototype, "StocktakingTagDetailID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "WarehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "warehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "itemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "ItemID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "itemId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "TagNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StocktakingTagDetailDto.prototype, "tagNumber", void 0);
class CreateStocktakingTagHeaderDto {
}
exports.CreateStocktakingTagHeaderDto = CreateStocktakingTagHeaderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "StocktakingPeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "stocktakingPeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "StocktakingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "stocktakingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "methodRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "StocktakingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "stocktakingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "StocktakingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "stocktakingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "OfficerPartyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "officerPartyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateStocktakingTagHeaderDto.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StocktakingTagDetailDto),
    __metadata("design:type", Array)
], CreateStocktakingTagHeaderDto.prototype, "details", void 0);
class UpdateStocktakingTagHeaderDto {
}
exports.UpdateStocktakingTagHeaderDto = UpdateStocktakingTagHeaderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "StocktakingPeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "stocktakingPeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "StocktakingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "stocktakingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "methodRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "StocktakingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "stocktakingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "StocktakingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "stocktakingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "OfficerPartyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "officerPartyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStocktakingTagHeaderDto.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StocktakingTagDetailDto),
    __metadata("design:type", Array)
], UpdateStocktakingTagHeaderDto.prototype, "details", void 0);
//# sourceMappingURL=stocktaking-tag.dto.js.map