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
exports.UpdateServiceSupplyRequestDto = exports.CreateServiceSupplyRequestDto = exports.CreateServiceSupplyRequestDetailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateServiceSupplyRequestDetailDto {
}
exports.CreateServiceSupplyRequestDetailDto = CreateServiceSupplyRequestDetailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDetailDto.prototype, "ItemRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDetailDto.prototype, "RequestQuantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDetailDto.prototype, "ApprovedQuantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceSupplyRequestDetailDto.prototype, "DeliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceSupplyRequestDetailDto.prototype, "Description", void 0);
class CreateServiceSupplyRequestDto {
}
exports.CreateServiceSupplyRequestDto = CreateServiceSupplyRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "BasisType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "BaseSource", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "RequestNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceSupplyRequestDto.prototype, "RequestDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "RequestType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "Priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "Status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceSupplyRequestDto.prototype, "Requester", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "RequesterRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceSupplyRequestDto.prototype, "WarehouseRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceSupplyRequestDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateServiceSupplyRequestDetailDto),
    __metadata("design:type", Array)
], CreateServiceSupplyRequestDto.prototype, "details", void 0);
class UpdateServiceSupplyRequestDto extends CreateServiceSupplyRequestDto {
}
exports.UpdateServiceSupplyRequestDto = UpdateServiceSupplyRequestDto;
//# sourceMappingURL=service-supply-request.dto.js.map