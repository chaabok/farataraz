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
exports.ItemAccountCategory = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let ItemAccountCategory = class ItemAccountCategory extends app_base_entity_1.AppBaseEntity {
};
exports.ItemAccountCategory = ItemAccountCategory;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ItemAccountCategoryID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ItemAccountCategoryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ItemAccountCategory.prototype, "ItemAccountCategoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ItemAccountCategory.prototype, "ItemAccountCategoryName2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, default: 1 }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "PricingMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, default: 1 }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "StandardRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ItemAccountCategory.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "InventorySlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "IndividualPurchaseSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "CorporatePurchaseSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "FreightSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "SuspensePurchaseSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ForeignPurchaseSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ScrapExpenseSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ConsignmentOursSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ConsignmentOthersSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ConsignmentOffsetSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "IndividualPrepaymentSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "CorporatePrepaymentSlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemAccountCategory.prototype, "ScrapIncomeSlAccountRef", void 0);
exports.ItemAccountCategory = ItemAccountCategory = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemAccountCategories' })
], ItemAccountCategory);
//# sourceMappingURL=item-account-category.entity.js.map