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
exports.UpsertSalesTrackingFactorSettingsDto = exports.UpsertSalesTrackingFactorSettingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpsertSalesTrackingFactorSettingDto {
}
exports.UpsertSalesTrackingFactorSettingDto = UpsertSalesTrackingFactorSettingDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'نوع سند فروش الزامی است' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'نوع سند فروش نمی‌تواند خالی باشد' }),
    (0, class_validator_1.Min)(1, { message: 'نوع سند فروش نامعتبر است' }),
    (0, class_validator_1.Max)(7, { message: 'نوع سند فروش نامعتبر است' }),
    __metadata("design:type", Number)
], UpsertSalesTrackingFactorSettingDto.prototype, "SalesDocumentType", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'مقدار نمایش عامل ردیابی باید true یا false باشد' }),
    __metadata("design:type", Boolean)
], UpsertSalesTrackingFactorSettingDto.prototype, "ShowTrackingFactor", void 0);
class UpsertSalesTrackingFactorSettingsDto {
}
exports.UpsertSalesTrackingFactorSettingsDto = UpsertSalesTrackingFactorSettingsDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'لیست تنظیمات باید آرایه باشد' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpsertSalesTrackingFactorSettingDto),
    __metadata("design:type", Array)
], UpsertSalesTrackingFactorSettingsDto.prototype, "settings", void 0);
//# sourceMappingURL=create-sales-tracking-factor-setting.dto.js.map