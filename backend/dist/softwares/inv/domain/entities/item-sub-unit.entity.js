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
exports.ItemSubUnit = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_entity_1 = require("./item.entity");
const measurement_unit_entity_1 = require("./measurement-unit.entity");
let ItemSubUnit = class ItemSubUnit extends app_base_entity_1.AppBaseEntity {
};
exports.ItemSubUnit = ItemSubUnit;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSubUnit.prototype, "ItemSubUnitID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSubUnit.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { onDelete: 'CASCADE', createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], ItemSubUnit.prototype, "Item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSubUnit.prototype, "SubUnitRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => measurement_unit_entity_1.MeasurementUnit, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'SubUnitRef' }),
    __metadata("design:type", measurement_unit_entity_1.MeasurementUnit)
], ItemSubUnit.prototype, "SubUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], ItemSubUnit.prototype, "MainToSubRatio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 2 }),
    __metadata("design:type", Number)
], ItemSubUnit.prototype, "IsVariableRatio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ItemSubUnit.prototype, "TolerancePercent", void 0);
exports.ItemSubUnit = ItemSubUnit = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemSubUnits' })
], ItemSubUnit);
//# sourceMappingURL=item-sub-unit.entity.js.map