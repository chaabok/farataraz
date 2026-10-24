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
exports.Item = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_enums_1 = require("../enums/item.enums");
const measurement_unit_entity_1 = require("./measurement-unit.entity");
const item_account_category_entity_1 = require("./item-account-category.entity");
let Item = class Item extends app_base_entity_1.AppBaseEntity {
};
exports.Item = Item;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Item.prototype, "ItemID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: item_enums_1.ItemType.GOODS }),
    __metadata("design:type", Number)
], Item.prototype, "ItemType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Item.prototype, "ItemCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "ItemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "ItemName2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Item.prototype, "MeasurementUnitRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => measurement_unit_entity_1.MeasurementUnit, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'MeasurementUnitRef' }),
    __metadata("design:type", measurement_unit_entity_1.MeasurementUnit)
], Item.prototype, "MeasurementUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "TechnicalSpecification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "DetailedAccountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Item.prototype, "TaxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Item.prototype, "DutyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "IranCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Item.prototype, "ItemAccountCategoryRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_account_category_entity_1.ItemAccountCategory, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemAccountCategoryRef' }),
    __metadata("design:type", item_account_category_entity_1.ItemAccountCategory)
], Item.prototype, "ItemAccountCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: item_enums_1.PricingMethod.WEIGHTED_AVERAGE }),
    __metadata("design:type", Number)
], Item.prototype, "PricingMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: item_enums_1.TaxAndDutyExemption.NONE }),
    __metadata("design:type", Number)
], Item.prototype, "TaxAndDutyExemption", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Item.prototype, "IsSalable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Item.prototype, "IsActive", void 0);
exports.Item = Item = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'Items' })
], Item);
//# sourceMappingURL=item.entity.js.map