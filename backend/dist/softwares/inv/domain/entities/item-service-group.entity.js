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
exports.ItemServiceGroup = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_service_group_field_entity_1 = require("./item-service-group-field.entity");
const item_service_group_related_product_entity_1 = require("./item-service-group-related-product.entity");
let ItemServiceGroup = class ItemServiceGroup extends app_base_entity_1.AppBaseEntity {
};
exports.ItemServiceGroup = ItemServiceGroup;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemServiceGroup.prototype, "ItemServiceGroupID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroup.prototype, "ItemServiceGroupCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroup.prototype, "ItemServiceGroupName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroup.prototype, "ItemServiceGroupName2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroup.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ItemServiceGroup.prototype, "IsMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemServiceGroup.prototype, "ParentRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ItemServiceGroup, (group) => group.children, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentRef', referencedColumnName: 'ItemServiceGroupID' }),
    __metadata("design:type", ItemServiceGroup)
], ItemServiceGroup.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ItemServiceGroup, (group) => group.parent),
    __metadata("design:type", Array)
], ItemServiceGroup.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_service_group_field_entity_1.ItemServiceGroupField, (field) => field.itemServiceGroup, { cascade: true }),
    __metadata("design:type", Array)
], ItemServiceGroup.prototype, "fields", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct, (prod) => prod.itemServiceGroup, { cascade: true }),
    __metadata("design:type", Array)
], ItemServiceGroup.prototype, "relatedProducts", void 0);
exports.ItemServiceGroup = ItemServiceGroup = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemServiceGroups' })
], ItemServiceGroup);
//# sourceMappingURL=item-service-group.entity.js.map