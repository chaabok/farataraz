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
exports.Warehouse = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const warehouse_type_enum_1 = require("./warehouse-type.enum");
const warehouse_nature_enum_1 = require("./warehouse-nature.enum");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
const warehouse_product_entity_1 = require("./warehouse-product.entity");
const warehouse_user_entity_1 = require("./warehouse-user.entity");
const warehouse_address_entity_1 = require("./warehouse-address.entity");
const warehouse_keeper_entity_1 = require("./warehouse-keeper.entity");
let Warehouse = class Warehouse extends app_base_entity_1.AppBaseEntity {
};
exports.Warehouse = Warehouse;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Warehouse.prototype, "WarehouseID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Warehouse.prototype, "WarehouseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "WarehouseCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "WarehouseTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "WarehouseTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Warehouse.prototype, "WarehouseNature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "Phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Warehouse.prototype, "DetailedAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountRef' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], Warehouse.prototype, "DetailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Warehouse.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Warehouse.prototype, "ParentRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Warehouse, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentRef' }),
    __metadata("design:type", Warehouse)
], Warehouse.prototype, "Parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "AddressState", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "AddressCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "AddressTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "AddressTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "PostalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "Longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "Latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Warehouse.prototype, "WarehouseKeeperRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseKeeperRef' }),
    __metadata("design:type", party_entity_1.Party)
], Warehouse.prototype, "WarehouseKeeper", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => warehouse_product_entity_1.WarehouseProduct, p => p.Warehouse, { cascade: true }),
    __metadata("design:type", Array)
], Warehouse.prototype, "WarehouseProducts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => warehouse_user_entity_1.WarehouseUser, u => u.Warehouse, { cascade: true }),
    __metadata("design:type", Array)
], Warehouse.prototype, "WarehouseUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => warehouse_address_entity_1.WarehouseAddress, a => a.Warehouse, { cascade: true }),
    __metadata("design:type", Array)
], Warehouse.prototype, "WarehouseAddresses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => warehouse_keeper_entity_1.WarehouseKeeper, k => k.Warehouse, { cascade: true }),
    __metadata("design:type", Array)
], Warehouse.prototype, "WarehouseKeepers", void 0);
exports.Warehouse = Warehouse = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'Warehouses' })
], Warehouse);
//# sourceMappingURL=warehouse.entity.js.map