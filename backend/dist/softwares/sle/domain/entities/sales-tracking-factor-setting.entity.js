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
exports.SalesTrackingFactorSetting = void 0;
const typeorm_1 = require("typeorm");
let SalesTrackingFactorSetting = class SalesTrackingFactorSetting {
};
exports.SalesTrackingFactorSetting = SalesTrackingFactorSetting;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesTrackingFactorSetting.prototype, "SalesTrackingFactorSettingID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], SalesTrackingFactorSetting.prototype, "SalesDocumentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesTrackingFactorSetting.prototype, "ShowTrackingFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesTrackingFactorSetting.prototype, "BusinessStructureRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesTrackingFactorSetting.prototype, "CompanyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesTrackingFactorSetting.prototype, "CreatorRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SalesTrackingFactorSetting.prototype, "CreationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesTrackingFactorSetting.prototype, "LastModifierRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SalesTrackingFactorSetting.prototype, "LastModificationDate", void 0);
exports.SalesTrackingFactorSetting = SalesTrackingFactorSetting = __decorate([
    (0, typeorm_1.Entity)({ name: 'SalesTrackingFactorSettings', schema: 'Sle' }),
    (0, typeorm_1.Index)('UQ_SalesTrackingFactorSettings_Type_BS', ['SalesDocumentType', 'BusinessStructureRef'], { unique: true })
], SalesTrackingFactorSetting);
//# sourceMappingURL=sales-tracking-factor-setting.entity.js.map