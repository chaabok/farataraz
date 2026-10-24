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
exports.SalesItemGroup = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const sales_item_group_related_product_entity_1 = require("./sales-item-group-related-product.entity");
let SalesItemGroup = class SalesItemGroup extends app_base_entity_1.AppBaseEntity {
};
exports.SalesItemGroup = SalesItemGroup;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesItemGroup.prototype, "SalesItemGroupID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroup.prototype, "SalesItemGroupCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroup.prototype, "SalesItemGroupName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroup.prototype, "SalesItemGroupName2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesItemGroup.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesItemGroup.prototype, "IsMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesItemGroup.prototype, "ParentRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SalesItemGroup, (group) => group.children, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentRef', referencedColumnName: 'SalesItemGroupID' }),
    __metadata("design:type", SalesItemGroup)
], SalesItemGroup.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SalesItemGroup, (group) => group.parent),
    __metadata("design:type", Array)
], SalesItemGroup.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_item_group_related_product_entity_1.SalesItemGroupRelatedProduct, (prod) => prod.salesItemGroup, { cascade: true }),
    __metadata("design:type", Array)
], SalesItemGroup.prototype, "relatedProducts", void 0);
exports.SalesItemGroup = SalesItemGroup = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesItemGroups' })
], SalesItemGroup);
//# sourceMappingURL=sales-item-group.entity.js.map