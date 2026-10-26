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
exports.CreateRecieptAndPaymentAccountingSettingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const reciept_and_payment_accounting_setting_enum_1 = require("../../domain/entities/reciept-and-payment-accounting-setting.enum");
class CreateRecieptAndPaymentAccountingSettingDto {
}
exports.CreateRecieptAndPaymentAccountingSettingDto = CreateRecieptAndPaymentAccountingSettingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "title_en", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "accountRef", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(reciept_and_payment_accounting_setting_enum_1.UsedEntryType),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "usedEntryType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(reciept_and_payment_accounting_setting_enum_1.RapOperationType),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "operationType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(reciept_and_payment_accounting_setting_enum_1.RapDetailedType),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "detailedType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(reciept_and_payment_accounting_setting_enum_1.TermType),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "termType", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateRecieptAndPaymentAccountingSettingDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-reciept-and-payment-accounting-setting.dto.js.map