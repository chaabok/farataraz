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
exports.StocktakingSetting = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const stocktaking_setting_warehouse_entity_1 = require("./stocktaking-setting-warehouse.entity");
let StocktakingSetting = class StocktakingSetting extends app_base_entity_1.AppBaseEntity {
};
exports.StocktakingSetting = StocktakingSetting;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "StocktakingSettingID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], StocktakingSetting.prototype, "MethodName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "CountTimes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StocktakingSetting.prototype, "CountWithTrackingFactors", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "Count1MinQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "Count1MinRial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "Count1MinTurnover", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'all_first' }),
    __metadata("design:type", String)
], StocktakingSetting.prototype, "Count2ListType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "Count2DiscrepancyPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'OR' }),
    __metadata("design:type", String)
], StocktakingSetting.prototype, "Count3CombineType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingSetting.prototype, "Count3DiscrepancyPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StocktakingSetting.prototype, "Count3Discrepancy1And2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StocktakingSetting.prototype, "Count3Discrepancy1AndInv", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StocktakingSetting.prototype, "Count3Discrepancy2AndInv", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocktaking_setting_warehouse_entity_1.StocktakingSettingWarehouse, (w) => w.stocktakingSetting, { cascade: true }),
    __metadata("design:type", Array)
], StocktakingSetting.prototype, "warehouses", void 0);
exports.StocktakingSetting = StocktakingSetting = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingSettings' })
], StocktakingSetting);
//# sourceMappingURL=stocktaking-setting.entity.js.map