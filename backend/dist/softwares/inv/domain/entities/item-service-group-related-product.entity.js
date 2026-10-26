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
exports.ItemServiceGroupRelatedProduct = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_service_group_entity_1 = require("./item-service-group.entity");
let ItemServiceGroupRelatedProduct = class ItemServiceGroupRelatedProduct extends app_base_entity_1.AppBaseEntity {
};
exports.ItemServiceGroupRelatedProduct = ItemServiceGroupRelatedProduct;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemServiceGroupRelatedProduct.prototype, "ItemServiceGroupRelatedProductID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemServiceGroupRelatedProduct.prototype, "ItemServiceGroupRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_service_group_entity_1.ItemServiceGroup, (group) => group.relatedProducts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemServiceGroupRef', referencedColumnName: 'ItemServiceGroupID' }),
    __metadata("design:type", item_service_group_entity_1.ItemServiceGroup)
], ItemServiceGroupRelatedProduct.prototype, "itemServiceGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroupRelatedProduct.prototype, "ProductCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroupRelatedProduct.prototype, "ProductName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroupRelatedProduct.prototype, "Unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ItemServiceGroupRelatedProduct.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroupRelatedProduct.prototype, "Description", void 0);
exports.ItemServiceGroupRelatedProduct = ItemServiceGroupRelatedProduct = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemServiceGroupRelatedProducts' })
], ItemServiceGroupRelatedProduct);
//# sourceMappingURL=item-service-group-related-product.entity.js.map