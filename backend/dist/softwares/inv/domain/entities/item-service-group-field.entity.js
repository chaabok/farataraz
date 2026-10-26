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
exports.ItemServiceGroupField = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_service_group_entity_1 = require("./item-service-group.entity");
let ItemServiceGroupField = class ItemServiceGroupField extends app_base_entity_1.AppBaseEntity {
};
exports.ItemServiceGroupField = ItemServiceGroupField;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemServiceGroupField.prototype, "ItemServiceGroupFieldID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemServiceGroupField.prototype, "ItemServiceGroupRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_service_group_entity_1.ItemServiceGroup, (group) => group.fields, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemServiceGroupRef', referencedColumnName: 'ItemServiceGroupID' }),
    __metadata("design:type", item_service_group_entity_1.ItemServiceGroup)
], ItemServiceGroupField.prototype, "itemServiceGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], ItemServiceGroupField.prototype, "FieldTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroupField.prototype, "FieldTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ItemServiceGroupField.prototype, "FieldType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ItemServiceGroupField.prototype, "IsRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ItemServiceGroupField.prototype, "Options", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ItemServiceGroupField.prototype, "RowNo", void 0);
exports.ItemServiceGroupField = ItemServiceGroupField = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemServiceGroupFields' })
], ItemServiceGroupField);
//# sourceMappingURL=item-service-group-field.entity.js.map