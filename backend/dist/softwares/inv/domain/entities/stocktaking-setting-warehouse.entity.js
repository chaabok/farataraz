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
exports.StocktakingSettingWarehouse = void 0;
const typeorm_1 = require("typeorm");
const stocktaking_setting_entity_1 = require("./stocktaking-setting.entity");
const warehouse_entity_1 = require("./warehouse.entity");
let StocktakingSettingWarehouse = class StocktakingSettingWarehouse {
};
exports.StocktakingSettingWarehouse = StocktakingSettingWarehouse;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingSettingWarehouse.prototype, "StocktakingSettingWarehouseID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingSettingWarehouse.prototype, "StocktakingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocktaking_setting_entity_1.StocktakingSetting, (setting) => setting.warehouses, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'StocktakingSettingRef' }),
    __metadata("design:type", stocktaking_setting_entity_1.StocktakingSetting)
], StocktakingSettingWarehouse.prototype, "stocktakingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingSettingWarehouse.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseRef' }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StocktakingSettingWarehouse.prototype, "warehouse", void 0);
exports.StocktakingSettingWarehouse = StocktakingSettingWarehouse = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingSettingWarehouses' })
], StocktakingSettingWarehouse);
//# sourceMappingURL=stocktaking-setting-warehouse.entity.js.map