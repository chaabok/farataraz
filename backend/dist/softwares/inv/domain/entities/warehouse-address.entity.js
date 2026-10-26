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
exports.WarehouseAddress = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const warehouse_entity_1 = require("./warehouse.entity");
let WarehouseAddress = class WarehouseAddress extends app_base_entity_1.AppBaseEntity {
};
exports.WarehouseAddress = WarehouseAddress;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseAddress.prototype, "WarehouseAddressID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseAddress.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, w => w.WarehouseAddresses, { createForeignKeyConstraints: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseRef' }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], WarehouseAddress.prototype, "Warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "AddressState", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "AddressCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "AddressTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "AddressTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "PostalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "Longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "Latitude", void 0);
exports.WarehouseAddress = WarehouseAddress = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseAddresses' })
], WarehouseAddress);
//# sourceMappingURL=warehouse-address.entity.js.map