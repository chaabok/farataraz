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
exports.SaveTreeDto = exports.UpdateItemServiceGroupDto = exports.CreateItemServiceGroupDto = exports.CreateItemServiceGroupRelatedProductDto = exports.CreateItemServiceGroupFieldDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateItemServiceGroupFieldDto {
}
exports.CreateItemServiceGroupFieldDto = CreateItemServiceGroupFieldDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupFieldDto.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupFieldDto.prototype, "field_title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupFieldDto.prototype, "field_title2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateItemServiceGroupFieldDto.prototype, "field_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return false;
        if (typeof value === 'boolean')
            return value;
        if (value === 'true' || value === '1' || value === 1)
            return true;
        if (value === 'false' || value === '0' || value === 0)
            return false;
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateItemServiceGroupFieldDto.prototype, "is_required", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupFieldDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateItemServiceGroupFieldDto.prototype, "RowNo", void 0);
class CreateItemServiceGroupRelatedProductDto {
}
exports.CreateItemServiceGroupRelatedProductDto = CreateItemServiceGroupRelatedProductDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupRelatedProductDto.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupRelatedProductDto.prototype, "product_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupRelatedProductDto.prototype, "product_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupRelatedProductDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return false;
        if (typeof value === 'boolean')
            return value;
        if (value === 'true' || value === '1' || value === 1)
            return true;
        if (value === 'false' || value === '0' || value === 0)
            return false;
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateItemServiceGroupRelatedProductDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupRelatedProductDto.prototype, "description", void 0);
class CreateItemServiceGroupDto {
}
exports.CreateItemServiceGroupDto = CreateItemServiceGroupDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupDto.prototype, "name2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemServiceGroupDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return false;
        if (typeof value === 'boolean')
            return value;
        if (value === 'true' || value === '1' || value === 1)
            return true;
        if (value === 'false' || value === '0' || value === 0)
            return false;
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateItemServiceGroupDto.prototype, "isMandatory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateItemServiceGroupDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateItemServiceGroupFieldDto),
    __metadata("design:type", Array)
], CreateItemServiceGroupDto.prototype, "additionalFields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateItemServiceGroupRelatedProductDto),
    __metadata("design:type", Array)
], CreateItemServiceGroupDto.prototype, "relatedProducts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemServiceGroupDto.prototype, "companyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemServiceGroupDto.prototype, "businessStructureRef", void 0);
class UpdateItemServiceGroupDto extends CreateItemServiceGroupDto {
}
exports.UpdateItemServiceGroupDto = UpdateItemServiceGroupDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateItemServiceGroupDto.prototype, "id", void 0);
class SaveTreeDto {
}
exports.SaveTreeDto = SaveTreeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SaveTreeDto.prototype, "treeData", void 0);
//# sourceMappingURL=item-service-group.dto.js.map