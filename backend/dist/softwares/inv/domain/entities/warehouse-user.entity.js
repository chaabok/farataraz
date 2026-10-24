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
exports.WarehouseUser = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const warehouse_entity_1 = require("./warehouse.entity");
const user_entity_1 = require("../../../../core/iam/entities/user.entity");
let WarehouseUser = class WarehouseUser extends app_base_entity_1.AppBaseEntity {
};
exports.WarehouseUser = WarehouseUser;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseUser.prototype, "WarehouseUserID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseUser.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, w => w.WarehouseUsers, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseRef' }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], WarehouseUser.prototype, "Warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseUser.prototype, "UserRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'UserRef' }),
    __metadata("design:type", user_entity_1.User)
], WarehouseUser.prototype, "User", void 0);
exports.WarehouseUser = WarehouseUser = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseUsers' })
], WarehouseUser);
//# sourceMappingURL=warehouse-user.entity.js.map