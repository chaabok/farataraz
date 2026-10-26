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
exports.SalesItemGroupRelatedProduct = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const sales_item_group_entity_1 = require("./sales-item-group.entity");
let SalesItemGroupRelatedProduct = class SalesItemGroupRelatedProduct extends app_base_entity_1.AppBaseEntity {
};
exports.SalesItemGroupRelatedProduct = SalesItemGroupRelatedProduct;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesItemGroupRelatedProduct.prototype, "SalesItemGroupRelatedProductID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesItemGroupRelatedProduct.prototype, "SalesItemGroupRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_item_group_entity_1.SalesItemGroup, (group) => group.relatedProducts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'SalesItemGroupRef', referencedColumnName: 'SalesItemGroupID' }),
    __metadata("design:type", sales_item_group_entity_1.SalesItemGroup)
], SalesItemGroupRelatedProduct.prototype, "salesItemGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroupRelatedProduct.prototype, "ProductCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroupRelatedProduct.prototype, "ProductName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroupRelatedProduct.prototype, "Unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SalesItemGroupRelatedProduct.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroupRelatedProduct.prototype, "Description", void 0);
exports.SalesItemGroupRelatedProduct = SalesItemGroupRelatedProduct = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesItemGroupRelatedProducts' })
], SalesItemGroupRelatedProduct);
//# sourceMappingURL=sales-item-group-related-product.entity.js.map