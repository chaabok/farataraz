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
exports.WarehouseProduct = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const warehouse_entity_1 = require("./warehouse.entity");
const measurement_unit_entity_1 = require("./measurement-unit.entity");
let WarehouseProduct = class WarehouseProduct extends app_base_entity_1.AppBaseEntity {
};
exports.WarehouseProduct = WarehouseProduct;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseProduct.prototype, "WarehouseProductID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseProduct.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, w => w.WarehouseProducts, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseRef' }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], WarehouseProduct.prototype, "Warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WarehouseProduct.prototype, "ProductCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], WarehouseProduct.prototype, "ProductTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseProduct.prototype, "MeasurementUnitRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => measurement_unit_entity_1.MeasurementUnit, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'MeasurementUnitRef' }),
    __metadata("design:type", measurement_unit_entity_1.MeasurementUnit)
], WarehouseProduct.prototype, "MeasurementUnit", void 0);
exports.WarehouseProduct = WarehouseProduct = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseProducts' })
], WarehouseProduct);
//# sourceMappingURL=warehouse-product.entity.js.map