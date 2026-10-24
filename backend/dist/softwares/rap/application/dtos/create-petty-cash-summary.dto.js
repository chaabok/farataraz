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
exports.CreatePettyCashSummaryDto = exports.CreatePettyCashSummaryItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const petty_cash_summary_enum_1 = require("../../domain/entities/petty-cash-summary.enum");
class CreatePettyCashSummaryItemDto {
}
exports.CreatePettyCashSummaryItemDto = CreatePettyCashSummaryItemDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryItemDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePettyCashSummaryItemDto.prototype, "paymentReceiptNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePettyCashSummaryItemDto.prototype, "paymentReceiptDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryItemDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePettyCashSummaryItemDto.prototype, "description", void 0);
class CreatePettyCashSummaryDto {
}
exports.CreatePettyCashSummaryDto = CreatePettyCashSummaryDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryDto.prototype, "pettyCashRef", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreatePettyCashSummaryDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePettyCashSummaryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryDto.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryDto.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(petty_cash_summary_enum_1.PettyCashSummaryState),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePettyCashSummaryDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePettyCashSummaryItemDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePettyCashSummaryDto.prototype, "items", void 0);
//# sourceMappingURL=create-petty-cash-summary.dto.js.map