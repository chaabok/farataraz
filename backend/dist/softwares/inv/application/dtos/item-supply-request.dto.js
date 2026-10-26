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
exports.UpdateItemSupplyRequestDto = exports.CreateItemSupplyRequestDto = exports.CreateItemSupplyRequestDetailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateItemSupplyRequestDetailDto {
}
exports.CreateItemSupplyRequestDetailDto = CreateItemSupplyRequestDetailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDetailDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDetailDto.prototype, "RequestQuantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDetailDto.prototype, "ApprovedQuantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemSupplyRequestDetailDto.prototype, "DeliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemSupplyRequestDetailDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateItemSupplyRequestDetailDto.prototype, "trackingFactorValues", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateItemSupplyRequestDetailDto.prototype, "TrackingFactorValues", void 0);
class CreateItemSupplyRequestDto {
}
exports.CreateItemSupplyRequestDto = CreateItemSupplyRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "BasisType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "BaseSource", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "RequestNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemSupplyRequestDto.prototype, "RequestDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "RequestType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "Priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "Status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemSupplyRequestDto.prototype, "Requester", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "RequesterRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemSupplyRequestDto.prototype, "WarehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemSupplyRequestDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateItemSupplyRequestDetailDto),
    __metadata("design:type", Array)
], CreateItemSupplyRequestDto.prototype, "details", void 0);
class UpdateItemSupplyRequestDto extends CreateItemSupplyRequestDto {
}
exports.UpdateItemSupplyRequestDto = UpdateItemSupplyRequestDto;
//# sourceMappingURL=item-supply-request.dto.js.map